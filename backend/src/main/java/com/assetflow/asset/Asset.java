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
    private String imagePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "asset")
    private List<AssetItem> assetItems = new ArrayList<>();

    public void changeCategory(Category category) {
        if (this.category != null) {
            this.category.getAssets().remove(this);
        }
        this.category = category;
        category.getAssets().add(this);
    }

    public Asset(String name, String explanation, Category category) {
        this.name = name;
        this.explanation = explanation;
        changeCategory(category);
    }

    public void update(String name, String explanation, Category category) {
        this.name = name;
        this.explanation = explanation;
        changeCategory(category);
    }

    public void changeImage(String imagePath) {
        this.imagePath = imagePath;
    }

    public void removeImage() {
        this.imagePath = null;
    }
}
