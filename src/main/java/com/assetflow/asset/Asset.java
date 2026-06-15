package com.assetflow.asset;

import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Getter
public class Asset {
    @Id
    @GeneratedValue
    @Column(name = "asset_id")
    private Long id;
    private String name;
    private String explanation;

    @Enumerated(EnumType.STRING)
    private AssetType assetType;
//    @CreatedDate
//    private LocalDateTime createDate;


}
