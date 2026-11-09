package com.hospitalCRUD.service;


import com.hospitalCRUD.entity.Image;
import com.hospitalCRUD.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {

    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp");

    private final ImageRepository imageRepository;

    public Image uploadImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image");
        }

        String contentType = file.getContentType() == null
                ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Upload a JPEG, PNG, or WEBP image");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("Image must be 5 MB or smaller");
        }

        byte[] imageData = file.getBytes();
        if (!matchesImageSignature(contentType, imageData)) {
            throw new IllegalArgumentException("The selected file is not a valid image");
        }

        Image image = new Image();
        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            default -> ".webp";
        };
        image.setFileName(UUID.randomUUID() + extension);
        image.setContentType(contentType);
        image.setImageData(imageData);

        return imageRepository.save(image);
    }

    public Image getImageById(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found"));
    }

    public void deleteImage(Long id) {
        Image image = getImageById(id);
        imageRepository.delete(image);
    }

    private boolean matchesImageSignature(String contentType, byte[] data) {
        if ("image/jpeg".equals(contentType)) {
            return data.length >= 3 && (data[0] & 0xff) == 0xff
                    && (data[1] & 0xff) == 0xd8 && (data[2] & 0xff) == 0xff;
        }
        if ("image/png".equals(contentType)) {
            byte[] signature = {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10};
            if (data.length < signature.length) return false;
            for (int index = 0; index < signature.length; index++) {
                if (data[index] != signature[index]) return false;
            }
            return true;
        }
        return data.length >= 12 && data[0] == 'R' && data[1] == 'I'
                && data[2] == 'F' && data[3] == 'F'
                && data[8] == 'W' && data[9] == 'E'
                && data[10] == 'B' && data[11] == 'P';
    }
}
