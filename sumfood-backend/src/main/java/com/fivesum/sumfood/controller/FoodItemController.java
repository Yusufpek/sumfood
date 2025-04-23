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
        String imagePath = ImagePath.getFootItemImagePathByRestaurant(restaurantName);
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

    @GetMapping("/items")
    public ResponseEntity<List<FoodItem>> getFoodItemsByRestaurant(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(foodItemService.getFoodItemByRestaurant(restaurant.get()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping(value = "/item", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FoodItem> addFoodItem(
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
                imagePath = restaurant.getName() + imageService
                        .saveImageToStorage(ImagePath.getFootItemImagePathByRestaurant(restaurant.getName()), file);
            } catch (IOException exception) {
                imagePath = ImagePath.DEFAULT_FOOD_ITEM_PATH;
            }

            request.setImagePath(imagePath);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(foodItemService.addFoodItem(request, restaurant));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping("/item/{itemId}")
    public ResponseEntity<FoodItem> updateFoodItem(@RequestHeader("Authorization") String token,
            @RequestBody FoodItemAddRequest request, @PathVariable() String itemId) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            try {
                long id = Long.valueOf(itemId);
                FoodItem foodItem = foodItemService.updateFoodItem(request, id);
                if (foodItem != null) {
                    return ResponseEntity.status(HttpStatus.OK).body(foodItem);
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }
            } catch (Exception except) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<?> addFoodItem(@RequestHeader("Authorization") String token,
            @PathVariable("itemId") String itemId) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            try {
                FoodItem toBeDeleted = foodItemService.getById(Long.valueOf(itemId));
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
