package com.assetflow.asset.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItemStatus;
import com.assetflow.asset.Category;
import com.assetflow.asset.dto.*;
import com.assetflow.asset.image.ImagesStorageService;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.asset.repository.CategoryRepository;
import com.assetflow.reservation.ReservationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final ImagesStorageService imagesStorageService;

    @Transactional
    public AssetCreateResponse createAsset(AssetCreateRequest request,
                                           MultipartFile image) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalStateException("존재하지않는 카테고리 입니다."));
        Asset asset = new Asset(
                request.getName(),
                request.getExplanation(),
                category

        );

        if (image != null && !image.isEmpty()) {
            String imagePath = imagesStorageService.save(image);
            asset.changeImage(imagePath);
        }

        assetRepository.save(asset);
        return new AssetCreateResponse(
                asset.getId(),
                asset.getName(),
                asset.getExplanation(),
                category.getId()
        );
    }

    public AssetDetailResponse getAssetDetail(Long assetId) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() ->
                new IllegalStateException("존재하지 않는 자산입니다."));
        List<AssetItemDetailResponse> assetItems =
                asset.getAssetItems().stream().map(assetItem ->
                        new AssetItemDetailResponse(
                                assetItem.getId(),
                                assetItem.getSerialNumber(),
                                assetItem.getLocation(),
                                assetItem.getAssetItemStatus(),
                                assetItem.getReservations().stream()
                                        .anyMatch(reservation ->
                                                reservation.getReservationStatus() == ReservationStatus.READY
                                        )
                        )).toList();

        int totalCount = assetItems.size();
        long availableCount = asset.getAssetItems().stream()
                .filter(assetItem -> assetItem.getAssetItemStatus() == AssetItemStatus.AVAILABLE)
                .filter(assetItem -> assetItem.getReservations().stream()
                        .noneMatch(reservation ->
                                reservation.getReservationStatus() == ReservationStatus.READY
                        ))
                .count();

        return new AssetDetailResponse(
                asset.getId(),
                asset.getName(),
                asset.getExplanation(),
                asset.getCategory().getName(),
                asset.getImagePath(),
                totalCount,
                availableCount,
                assetItems
        );
    }

    @Transactional
    public void assetDelete(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("존재 하지않는 자산입니다."));

        if (!asset.getAssetItems().isEmpty()) {
            throw new IllegalStateException("자산 품목이 존재하는 자산은 삭제 할 수 없습니다.");
        }

        imagesStorageService.delete(asset.getImagePath());
        assetRepository.delete(asset);
    }

    public Page<AssetSearchResponse> searchAssets(AssetSearchCondition condition, Pageable pageable) {
        return assetRepository.searchAssets(condition, pageable);
    }

    @Transactional
    public void updateAsset(Long assetId, AssetUpdateRequest request) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalStateException("존재 하지 않는 자산입니다."));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 카테고리 입니다."));

        asset.update(
                request.getName(),
                request.getExplanation(),
                category
        );
    }

    @Transactional
    public void updateAssetImage(Long assetId, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("이미지를 선택해주세요.");
        }

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 자산입니다."));

        String oldImagePath = asset.getImagePath();
        String newImagePath = imagesStorageService.save(image);
        asset.changeImage(newImagePath);
        imagesStorageService.delete(oldImagePath);
    }

    @Transactional
    public void deleteAssetImage(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 자산입니다."));

        imagesStorageService.delete(asset.getImagePath());

        asset.removeImage();
    }


}
