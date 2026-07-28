package com.assetflow.asset.controller;

import com.assetflow.asset.dto.AssetItemCreateRequest;
import com.assetflow.asset.dto.AssetItemCreateResponse;
import com.assetflow.asset.dto.AssetItemResponse;
import com.assetflow.asset.service.AssetItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/asset-items")
public class AssetItemController {
    private final AssetItemService assetItemService;

    @GetMapping
    public List<AssetItemResponse> getAllAssetItems() {
        return assetItemService.getAllAssetItems();
    }

    @PostMapping
    public AssetItemCreateResponse createAssetItem(@Valid @RequestBody AssetItemCreateRequest request) {
       return assetItemService.createAssetItem(request);
    }

    @DeleteMapping("/{assetItemId}")
    public void deleteAssetItem(@PathVariable Long assetItemId){
       assetItemService.deleteAssetItem(assetItemId);
    }
}
