package com.assetflow.asset;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Asset {
    @Id
    @GeneratedValue
    @Column(name = "asset_id")
    private Long id;
    private String name;
    private String explanation;

    @Enumerated(EnumType.STRING)
    private AssetType assetType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "asset")
    private List<AssetItem> assetItems = new ArrayList<>();

    public void changeCategory(Category category) {
        this.category = category;
        category.getAssets().add(this);
    }

//    @CreatedDate
//    private LocalDateTime createDate;

}
