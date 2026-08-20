package com.assetflow.asset.controller;

import com.assetflow.asset.dto.*;
import com.assetflow.asset.service.AssetItemService;
import com.assetflow.auth.security.CustomUserDetails;
import com.assetflow.member.Member;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/asset-items")
public class AssetItemController {
    private final AssetItemService assetItemService;

    @GetMapping
    public Page<AssetItemAdminResponse> getAllAssetItems(
            AssetItemSearchCondition condition,
            Pageable pageable
    ) {
        return assetItemService.getAllAssetItems(condition, pageable);
    }

    @PostMapping
    public AssetItemCreateResponse createAssetItem(@Valid @RequestBody AssetItemCreateRequest request) {
       return assetItemService.createAssetItem(request);
    }

    @GetMapping("/{assetId}")
    public List<AssetItemResponse> getAssetItemsByAsset(
            @PathVariable Long assetId,
            Authentication authentication
    ) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();
        Member member = userDetails.getMember();
        return assetItemService.getAssetItemsByAsset(assetId, member);
    }

    @DeleteMapping("/{assetItemId}")
    public void deleteAssetItem(@PathVariable Long assetItemId){
       assetItemService.deleteAssetItem(assetItemId);
    }

    @PatchMapping("/{assetItemId}")
    public void updateAssetItem(
            @PathVariable Long assetItemId,
            @Valid @RequestBody AssetItemUpdateRequest request
    ) {
        assetItemService.updateAssetItem(assetItemId, request);
    }
}
