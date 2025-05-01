package com.fivesum.sumfood.constants;

public class ImagePath {
    static final String IMAGE_BASE = "src/main/resources/static/images/";

    // Restaurant
    public static final String RESTAURANT_LOGO_PATH = IMAGE_BASE + "restaurant_logos/";
    // Food Item
    public static final String FOOD_ITEM_PATH = IMAGE_BASE + "food_items/";

    public static String getFoodItemImagePathByRestaurant(String restaurantName) {
        restaurantName = restaurantName.replace(" ", "_");
        return FOOD_ITEM_PATH + restaurantName + "/";
    }

    public static final String DEFAULT_FOOD_ITEM_PATH = FOOD_ITEM_PATH + "default.png";
}