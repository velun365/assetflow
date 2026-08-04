package com.assetflow.asset.controller;

import com.assetflow.asset.dto.*;
import com.assetflow.asset.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService assetService;

    @PostMapping
    public AssetCreateResponse createAsset(@Valid @RequestBody AssetCreateRequest request) {
        return assetService.createAsset(request);
    }

    @GetMapping("{assetId}")
    public AssetDetailResponse getAssetDetail(@PathVariable Long assetId){
        return assetService.getAssetDetail(assetId);
    }

    @DeleteMapping("/{assetId}")
    public ResponseEntity<Void> deleteAsset(@PathVariable("assetId") Long assetId ) {
        assetService.assetDelete(assetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public Page<AssetSearchResponse> searchAssets(AssetSearchCondition condition, Pageable pageable) {
        return assetService.searchAssets(condition, pageable);
    }
}
    