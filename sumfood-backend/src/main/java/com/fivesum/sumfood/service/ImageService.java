package com.fivesum.sumfood.service;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageService {

    public String saveImageToStorage(String uploadDirectory, MultipartFile imageFile) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH-mm-ss_dd-MM-yyyy"));
        String originalName = imageFile.getOriginalFilename();
        String uniqueFileName = timestamp + "_" + originalName;

        Path uploadPath = Paths.get(uploadDirectory);
        Path filePath = uploadPath.resolve(uniqueFileName);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFileName;
    }

    public byte[] getImage(String imageDirectory, String imageName) throws IOException {
        Path imagePath = Paths.get(imageDirectory, imageName);

        if (Files.exists(imagePath)) {
            return Files.readAllBytes(imagePath);
        } else {
            return null; // Handle missing images
        }
    }

    public String deleteImage(String imageDirectory, String imageName) throws IOException {
        Path imagePath = Paths.get(imageDirectory, imageName);

        if (Files.exists(imagePath)) {
            Files.delete(imagePath);
            return "Success";
        } else {
            return "Failed"; // Handle missing images
        }
    }
}
