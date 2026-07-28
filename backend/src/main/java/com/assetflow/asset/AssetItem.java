package com.assetflow.asset;

import com.assetflow.reservation.Reservation;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AssetItem {
    @Id
    @GeneratedValue
    @Column(name = "asset_item_id")
    private Long id;
    private String serialNumber;
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @Enumerated(EnumType.STRING)
    private AssetItemStatus assetItemStatus;

    @OneToMany(mappedBy = "assetItem")
    private List<Reservation> reservations = new ArrayList<>();

    public AssetItem(String serialNumber, String location, Asset asset) {
        this.serialNumber = serialNumber;
        this.location = location;
        changeAsset(asset);
        this.assetItemStatus = AssetItemStatus.AVAILABLE;
    }

    public void rentAsset() {
        if (this.assetItemStatus != AssetItemStatus.AVAILABLE) {
            throw new IllegalStateException("대여 가능한 자산 품목이 아닙니다.");
        }

        this.assetItemStatus = AssetItemStatus.RENTED;
    }
    public void returnAsset() {
        if (this.assetItemStatus != AssetItemStatus.RENTED) {
            throw new IllegalStateException("대여 중인 자산 품목만 반납할 수 있습니다.");
        }
        this.assetItemStatus = AssetItemStatus.AVAILABLE;
    }

    public void changeAsset(Asset asset) {
        this.asset = asset;
        asset.getAssetItems().add(this);
    }

    public void dispose() {
        if (this.assetItemStatus == AssetItemStatus.RENTED) {
            throw new IllegalStateException(
                    "대여 중인 자산 품목은 폐기할 수 없습니다."
            );
        }

        if (this.assetItemStatus == AssetItemStatus.DISPOSED) {
            throw new IllegalStateException(
                    "이미 폐기된 자산 품목입니다."
            );
        }

        this.assetItemStatus = AssetItemStatus.DISPOSED;
    }


}
