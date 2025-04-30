package com.fivesum.sumfood.controller;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fivesum.sumfood.constants.ImagePath;
import com.fivesum.sumfood.dto.FoodItemAddRequest;
import com.fivesum.sumfood.dto.FoodItemResponse;
import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.enums.Category;
import com.fivesum.sumfood.service.FoodItemService;
import com.fivesum.sumfood.service.ImageService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.RestaurantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodItemController {
    private final FoodItemService foodItemService;
    private final ImageService imageService;
    private final JwtService jwtService;
    private final RestaurantService restaurantService;

    @GetMapping("/public/image/{restaurantName}/{imageName}")
    public ResponseEntity<byte[]> getImage(
            @PathVariable String restaurantName,
            @PathVariable String imageName) throws IOException {
        String imagePath = ImagePath.getFoodItemImagePathByRestaurant(restaurantName);
        byte[] image = imageService.getImage(imagePath, imageName);
        if (image != null) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
                    .body(image);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/public/items")
    public ResponseEntity<List<FoodItem>> getAllFoodItems() {
        return ResponseEntity.ok(foodItemService.getAllFoodItems());
    }

    @GetMapping("/public/items/{categoryStr}")
    public ResponseEntity<List<FoodItem>> getFoodItemByCategory(@PathVariable() String categoryStr) {
        try {
            Category category = Category.valueOf(categoryStr.toUpperCase());
            return ResponseEntity.ok(foodItemService.getItemsByCategory(category));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/items/restaurant")
    public ResponseEntity<List<FoodItemResponse>> getFoodItemsByRestaurant(
            @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(foodItemService.getFoodItemByRestaurant(restaurant.get()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping(value = "/item", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FoodItemResponse> addFoodItem(
            @RequestHeader("Authorization") String token,
            @RequestPart("foodItem") FoodItemAddRequest request,
            @RequestPart("file") MultipartFile file) {
        System.out.println("Add item");
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurantOpt = restaurantService.findByEmail(email);
        if (restaurantOpt.isPresent()) {
            Restaurant restaurant = restaurantOpt.get();
            String imagePath;
            try {
                imagePath = imageService.saveImageToStorage(
                        ImagePath.getFoodItemImagePathByRestaurant(restaurant.getBusinessName()),
                        file);
            } catch (IOException exception) {
                imagePath = ImagePath.DEFAULT_FOOD_ITEM_PATH;
            }

            request.setImagePath(imagePath);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(foodItemService.addFoodItem(request, restaurant));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping(value = "/item/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateFoodItem(@RequestHeader("Authorization") String token,
            @RequestPart("foodItem") FoodItemAddRequest request, @PathVariable() String itemId,
            @RequestPart(value = "file", required = false) MultipartFile file) { // Make file optional
        System.out.printf("Update item request received for ID: %s%n", itemId);
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurantOpt = restaurantService.findByEmail(email);

        if (!restaurantOpt.isPresent()) {
            System.out.printf("Restaurant not found for email: %s%n", email);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant not found or token invalid.");
        }

        FoodItem existingFoodItem = null;
        Restaurant restaurant = restaurantOpt.get();
        long id;
        try {
            id = Long.parseLong(itemId);
        } catch (NumberFormatException e) {
            System.out.printf("Invalid item ID format: %s%n", itemId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid item ID format.");
        }
        try {
            existingFoodItem = foodItemService.getById(id);
        } catch (Exception e) {
            System.out.println("Error retrieving food item with ID: " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving food item.");
        }

        // Verify ownership
        if (!existingFoodItem.getRestaurant().getId().equals(restaurant.getId())) {
            System.out.println("Forbidden: Restaurant ID " + restaurant.getId() + " does not own Food Item ID " + id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You do not have permission to update this item.");
        }

        // Handle image update
        String imagePath = existingFoodItem.getImageName(); // Keep existing path by default

        if (file != null && !file.isEmpty()) {
            System.out.println("New image file provided for item ID: " + id);
            try {
                // Delete old image if it's not the default one
                if (existingFoodItem.getImageName() != null
                        && !existingFoodItem.getImageName().equals(ImagePath.DEFAULT_FOOD_ITEM_PATH)) {
                    System.out.println("Deleting old image: " + existingFoodItem.getImageName() + " in path: "
                            + ImagePath.getFoodItemImagePathByRestaurant(restaurant.getBusinessName()));
                    imageService.deleteImage(
                            ImagePath.getFoodItemImagePathByRestaurant(restaurant.getBusinessName()),
                            existingFoodItem.getImageName());
                }

                // Save new image
                System.out.println("Saving new image for item ID: " + id);
                imagePath = imageService.saveImageToStorage(
                        ImagePath.getFoodItemImagePathByRestaurant(restaurant.getBusinessName()),
                        file);
                request.setImagePath(imagePath); // Set new path in the request DTO
                System.out.println("New image saved at path: " + imagePath);

            } catch (IOException e) {
                System.err.println("Error processing image for item ID " + id + ": " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update image.");
            }
        } else {
            System.out.println("No new image file provided for item ID: " + id + ". Keeping existing image path: "
                    + existingFoodItem.getImageName());
        }

        try {
            System.out.println("Attempting to update food item with ID: " + id);
            FoodItemResponse updatedFoodItem = foodItemService.updateFoodItem(request, id);

            if (updatedFoodItem != null) {
                System.out.println("Food item updated successfully: ID " + id);
                return ResponseEntity.status(HttpStatus.OK).body(updatedFoodItem);
            } else {
                System.err.println("Food item update returned null for ID: " + id);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update food item.");
            }
        } catch (Exception e) {
            System.err.println("Exception during food item update for ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating the food item.");
        }
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<?> deleteFoodItem(@RequestHeader("Authorization") String token,
            @PathVariable("itemId") String itemId) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            try {
                FoodItem toBeDeleted = foodItemService.getById(Long.valueOf(itemId));
                imageService.deleteImage(
                        ImagePath.getFoodItemImagePathByRestaurant(toBeDeleted.getRestaurant().getBusinessName()),
                        toBeDeleted.getImageName());
                boolean response = foodItemService.deleteFoodItem(toBeDeleted);
                if (response) {
                    return ResponseEntity.status(HttpStatus.OK).body("Deleted succesfully");
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Deleted failed");
                }
            } catch (Exception exception) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("ID invalid");
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
