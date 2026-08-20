package com.assetflow.asset.controller;

import com.assetflow.asset.dto.*;
import com.assetflow.asset.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService assetService;

    @PostMapping
    public AssetCreateResponse createAsset(@Valid @RequestPart("request") AssetCreateRequest request,
                                           @RequestPart(value = "image", required = false) MultipartFile image) {
        return assetService.createAsset(request, image);
    }

    @GetMapping("{assetId}")
    public AssetDetailResponse getAssetDetail(@PathVariable Long assetId) {
        return assetService.getAssetDetail(assetId);
    }

    @DeleteMapping("/{assetId}")
    public ResponseEntity<Void> deleteAsset(@PathVariable("assetId") Long assetId) {
        assetService.assetDelete(assetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public Page<AssetSearchResponse> searchAssets(AssetSearchCondition condition, Pageable pageable) {
        return assetService.searchAssets(condition, pageable);
    }

    @PatchMapping("/{assetId}")
    public void updateAsset(
            @PathVariable Long assetId,
            @Valid @RequestBody AssetUpdateRequest request
    ){
        assetService.updateAsset(assetId, request);
    }

    @PatchMapping("/{assetId}/image")
    public void updateAssetImage(
            @PathVariable Long assetId,
            @RequestPart("image") MultipartFile image
    ) {
        assetService.updateAssetImage(assetId, image);
    }

    @DeleteMapping("/{assetId}/image")
    public void deleteAssetImage(
            @PathVariable Long assetId
    ) {
        assetService.deleteAssetImage(assetId);
    }
}
    