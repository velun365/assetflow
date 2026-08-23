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
        validateImage(image);
        try {
            Files.createDirectories(uploadDir);

            String extension = getExtension(image.getContentType());
            String storedFilename = UUID.randomUUID() + extension;

            Path targetPath = uploadDir.resolve(storedFilename);

            image.transferTo(targetPath);

            return "/uploads/assets/" + storedFilename;
        } catch (IOException e) {
            throw new IllegalStateException("이미지 저장에 실패했습니다.");
        }
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일을 선택해주세요.");
        }

        String contentType = image.getContentType();

        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/webp"))) {
            throw new IllegalArgumentException(
                    "JPG, PNG, WEBP 형식의 이미지만 업로드 할 수 있습니다."
            );
        }

        String originalFilename = image.getOriginalFilename();

        if (originalFilename == null) {
            throw new IllegalArgumentException(
                    "파일명을 확인할 수 없습니다.");
        }

        String lowerFilename = originalFilename.toLowerCase();

        if (!(lowerFilename.endsWith(".jpg")
                || lowerFilename.endsWith(".jpeg")
                || lowerFilename.endsWith(".png")
                || lowerFilename.endsWith(".webp"))) {

            throw new IllegalArgumentException(
                    "JPG, PNG, WEBP 확장자의 파일만 업로드 할 수 있습니다."
            );
        }
    }

    private String getExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException(
                    "지원하지 않는 이미지 형식입니다."
            );
        };
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
