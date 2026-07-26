package com.assetflow.asset.repository;

import com.assetflow.asset.AssetType;
import com.assetflow.asset.dto.AssetSearchCondition;
import com.assetflow.asset.dto.AssetSearchResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import java.util.List;

import static com.assetflow.asset.QAsset.*;
import static com.assetflow.asset.QCategory.category;
import static org.springframework.util.StringUtils.*;

public class AssetRepositoryImpl implements AssetRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    public AssetRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<AssetSearchResponse> searchAssets(AssetSearchCondition condition, Pageable pageable) {
        List<AssetSearchResponse> content = queryFactory
                .select(
                        Projections.constructor(
                                AssetSearchResponse.class,
                                asset.id,
                                asset.name,
                                asset.assetType,
                                category.name
                        ))
                .from(asset)
                .leftJoin(asset.category, category)
                .where(
                        nameEq(condition.getName()),
                        assetTypeEq(condition.getAssetType()),
                        categoryNameEq(condition.getCategoryName())
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(asset.count())
                .from(asset)
                .leftJoin(asset.category, category)
                .where(
                        nameEq(condition.getName()),
                        assetTypeEq(condition.getAssetType()),
                        categoryNameEq(condition.getCategoryName())
                );

        return PageableExecutionUtils.getPage(content, pageable, () -> countQuery.fetchOne());

    }




    private BooleanExpression nameEq(String name) {
        return hasText(name) ? asset.name.eq(name) : null;
    }
    private BooleanExpression assetTypeEq(AssetType assetType) {
        return assetType != null ? asset.assetType.eq(assetType) : null;
    }
    private BooleanExpression categoryNameEq(String categoryName) {
        return hasText(categoryName) ? category.name.eq(categoryName) : null;
    }

}
