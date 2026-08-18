package com.assetflow.asset.repository;

import com.assetflow.asset.AssetItemStatus;
import com.assetflow.asset.dto.AssetItemAdminResponse;
import com.assetflow.asset.dto.AssetItemSearchCondition;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;

import static com.assetflow.asset.QAsset.asset;
import static com.assetflow.asset.QAssetItem.assetItem;
import static org.springframework.util.StringUtils.hasText;

public class AssetItemRepositoryImpl implements AssetItemRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    public AssetItemRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<AssetItemAdminResponse> searchAssetItems(
            AssetItemSearchCondition condition,
            Pageable pageable
    ) {
        List<AssetItemAdminResponse> content = queryFactory
                .select(Projections.constructor(
                        AssetItemAdminResponse.class,
                        assetItem.id,
                        assetItem.serialNumber,
                        assetItem.location,
                        assetItem.assetItemStatus,
                        asset.id,
                        asset.name
                ))
                .from(assetItem)
                .join(assetItem.asset, asset)
                .where(
                        serialNumberContains(condition.getSerialNumber()),
                        assetNameContains(condition.getAssetName()),
                        assetItemStatusEq(condition.getAssetItemStatus())
                )
                .orderBy(assetItem.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(assetItem.count())
                .from(assetItem)
                .join(assetItem.asset, asset)
                .where(
                        serialNumberContains(condition.getSerialNumber()),
                        assetNameContains(condition.getAssetName()),
                        assetItemStatusEq(condition.getAssetItemStatus())
                );

        return PageableExecutionUtils.getPage(
                content,
                pageable,
                countQuery::fetchOne
        );
    }

    private BooleanExpression serialNumberContains(String serialNumber) {
        return hasText(serialNumber)
                ? assetItem.serialNumber.containsIgnoreCase(serialNumber)
                : null;
    }

    private BooleanExpression assetNameContains(String assetName) {
        return hasText(assetName)
                ? asset.name.containsIgnoreCase(assetName)
                : null;
    }

    private BooleanExpression assetItemStatusEq(AssetItemStatus assetItemStatus) {
        return assetItemStatus != null
                ? assetItem.assetItemStatus.eq(assetItemStatus)
                : null;
    }
}
