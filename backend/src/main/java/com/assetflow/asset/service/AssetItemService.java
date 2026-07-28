package com.assetflow.asset.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItem;
import com.assetflow.asset.AssetItemStatus;
import com.assetflow.asset.dto.AssetItemCreateRequest;
import com.assetflow.asset.dto.AssetItemCreateResponse;
import com.assetflow.asset.dto.AssetItemResponse;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.reservation.ReservationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AssetItemService {
    private final AssetItemRepository assetItemRepository;
    private final AssetRepository assetRepository;

    public List<AssetItemResponse> getAllAssetItems() {
       return assetItemRepository.findAll()
               .stream()
               .map(assetItem -> new AssetItemResponse(
                       assetItem.getId(),
                       assetItem.getSerialNumber(),
                       assetItem.getLocation(),
                       assetItem.getAssetItemStatus(),
                       assetItem.getAsset().getId(),
                       assetItem.getAsset().getName()
               ))
               .toList();
    }

    @Transactional
    public AssetItemCreateResponse createAssetItem(AssetItemCreateRequest request) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new IllegalStateException("해당 자산은 자산목록에 없습니다."));
        AssetItem assetItem = new AssetItem(
                request.getSerialNumber(),
                request.getLocation(),
                asset
        );
        assetItemRepository.save(assetItem);
        AssetItemCreateResponse response = new AssetItemCreateResponse(
                assetItem.getId(),
                assetItem.getSerialNumber(),
                assetItem.getLocation(),
                request.getAssetId(),
                assetItem.getAssetItemStatus()
        );

        return response;
    }

    @Transactional
    public void deleteAssetItem(Long assetItemId){
        AssetItem assetItem = assetItemRepository.findById(assetItemId)
                .orElseThrow(() -> new IllegalStateException(
                        "해당 자산 품목을 찾을 수 없습니다."
                ));

        assetItem.dispose();
    }
}
