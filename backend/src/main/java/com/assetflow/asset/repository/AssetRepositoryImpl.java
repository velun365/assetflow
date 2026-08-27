package com.assetflow.asset.repository;

import com.assetflow.asset.QAssetItem;
import com.assetflow.asset.dto.AssetSearchCondition;
import com.assetflow.asset.dto.AssetSearchResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import java.util.List;
import com.assetflow.asset.AssetItemStatus;
import com.assetflow.reservation.ReservationStatus;
import com.querydsl.core.types.dsl.CaseBuilder;
import static com.assetflow.asset.QAsset.*;
import static com.assetflow.asset.QCategory.category;
import static com.assetflow.asset.QAssetItem.assetItem;
import static com.assetflow.reservation.QReservation.reservation;
import static org.springframework.util.StringUtils.*;

public class AssetRepositoryImpl implements AssetRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    public AssetRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<AssetSearchResponse> searchAssets(
            AssetSearchCondition condition,
            Pageable pageable
    ) {
        List<AssetSearchResponse> content = queryFactory
                .select(
                        Projections.constructor(
                                AssetSearchResponse.class,
                                asset.id,
                                asset.name,
                                category.name,

                                // 전체 품목 수
                                assetItem.id.countDistinct(),

                                // 대여 가능 품목 수
                                new CaseBuilder()
                                        .when(
                                                assetItem.assetItemStatus.eq(AssetItemStatus.AVAILABLE)
                                                        .and(reservation.id.isNull())
                                        )
                                        .then(1L)
                                        .otherwise(0L)
                                        .sum()
                        )
                )
                .from(asset)
                .leftJoin(asset.category, category)
                .leftJoin(asset.assetItems, assetItem)
                .leftJoin(assetItem.reservations, reservation)
                .on(reservation.reservationStatus.eq(ReservationStatus.READY))
                .where(
                        nameContains(condition.getName()),
                        categoryNameContains(condition.getCategoryName()),
                        hasNonDisposedAssetItem(condition.getActiveOnly())
                )
                .groupBy(asset.id, asset.name, category.name)
                .orderBy(asset.id.asc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(asset.count())
                .from(asset)
                .leftJoin(asset.category, category)
                .where(
                        nameContains(condition.getName()),
                        categoryNameContains(condition.getCategoryName()),
                        hasNonDisposedAssetItem(condition.getActiveOnly())
                );

        return PageableExecutionUtils.getPage(
                content,
                pageable,
                () -> countQuery.fetchOne()
        );
    }

    private BooleanExpression hasNonDisposedAssetItem(Boolean activeOnly) {
        if (!Boolean.TRUE.equals(activeOnly)) {
            return null;
        }

        QAssetItem subAssetItem = new QAssetItem("subAssetItem");

        return JPAExpressions
                .selectOne()
                .from(subAssetItem)
                .where(
                        subAssetItem.asset.eq(asset),
                        subAssetItem.assetItemStatus.ne(AssetItemStatus.DISPOSED)
                )
                .exists();
    }


    private BooleanExpression nameContains(String name) {
        return hasText(name)
                ? asset.name.containsIgnoreCase(name)
                : null;
    }

    private BooleanExpression categoryNameContains(String categoryName) {
        return hasText(categoryName)
                ? category.name.contains(categoryName)
                : null;
    }
}
