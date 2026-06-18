package com.assetflow.asset.repository;

import com.assetflow.asset.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
