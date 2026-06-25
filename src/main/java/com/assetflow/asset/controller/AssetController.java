package com.assetflow.asset.controller;

import com.assetflow.asset.Asset;
import com.assetflow.asset.dto.AssetCreateRequest;
import com.assetflow.asset.dto.AssetCreateResponse;
import com.assetflow.asset.service.AssetService;
import com.assetflow.member.dto.MemberCreateResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @DeleteMapping("/{assetId}")
    public ResponseEntity<Void> deleteAsset(@PathVariable("assetId") Long assetId ) {
        assetService.assetDelete(assetId);
        return ResponseEntity.noContent().build();
    }
}
