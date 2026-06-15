package com.assetflow.asset;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;

@Entity
@Getter
public class AssetItem {
    @Id
    @Getter
    @Column(name = "AssertItem")
    private Long id;
    private String location;
}
