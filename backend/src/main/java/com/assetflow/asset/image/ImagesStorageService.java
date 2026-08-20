package com.assetflow.asset.image;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImagesStorageService {
    private final Path uploadDir = Paths.get("uploads/assets");
    public String save(MultipartFile image) {
        try {
            Files.createDirectories(uploadDir);
            String originalFilename = image.getOriginalFilename();
            String extension = "";
            if(originalFilename != null && originalFilename.contains(".")){
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String storedFilename = UUID.randomUUID() + extension;
            Path targetPath = uploadDir.resolve(storedFilename);
            image.transferTo(targetPath);
            return "/uploads/assets/" + storedFilename;
        } catch (IOException e) {
            throw new IllegalStateException("이미지 저장에 실패했습니다.");
        }
    }

    public void delete(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return;
        }

        try {
            String filename = Paths.get(imagePath)
                    .getFileName()
                    .toString();

            Path targetPath = uploadDir.resolve(filename);

            Files.deleteIfExists(targetPath);

        } catch (IOException e) {
            throw new IllegalStateException("이미지 삭제에 실패했습니다.");
        }
    }

}
