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
        this.assetItemStatus = AssetItemStatus.RENTED;
    }
    public void returnAsset() {
        this.assetItemStatus = AssetItemStatus.AVAILABLE;
    }

    public void changeAsset(Asset asset) {
        this.asset = asset;
        asset.getAssetItems().add(this);
    }

}
