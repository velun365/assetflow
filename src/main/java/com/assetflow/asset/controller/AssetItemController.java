package com.assetflow.asset.controller;

import com.assetflow.asset.dto.AssetItemCreateRequest;
import com.assetflow.asset.dto.AssetItemCreateResponse;
import com.assetflow.asset.service.AssetItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/asset-items")
public class AssetItemController {
    private final AssetItemService assetItemService;

    @PostMapping
    public AssetItemCreateResponse AssetItemCreate(@RequestBody AssetItemCreateRequest request) {
       return assetItemService.createAssetItem(request);
    }
}
