package com.assetflow.reservation.repository;

import com.assetflow.reservation.ReservationStatus;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import java.time.LocalDate;
import java.util.List;

import static com.assetflow.asset.QAsset.*;
import static com.assetflow.asset.QAssetItem.*;
import static com.assetflow.member.QMember.member;
import static com.assetflow.reservation.QReservation.*;
import static org.springframework.util.StringUtils.*;

public class ReservationRepositoryImpl implements ReservationRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    public ReservationRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<ReservationSearchResponse> searchReservation(ReservationSearchCondition condition, Pageable pageable) {
        List<ReservationSearchResponse> content = queryFactory
                .select(
                        Projections.constructor(
                                ReservationSearchResponse.class,
                                reservation.id,
                                member.name,
                                asset.name,
                                reservation.reservationStatus,
                                reservation.reservedAt
                        )
                )
                .from(reservation)
                .join(reservation.assetItem, assetItem)
                .join(assetItem.asset, asset)
                .join(reservation.member, member)
                .where(
                        memberNameEq(condition.getMemberName()),
                        assetNameEq(condition.getAssetName()),
                        reservationStatusEq(condition.getReservationStatus()),
                        reservationDateGoe(condition.getReserveAtFrom()),
                        reservationDateLoe(condition.getReserveAtTo())
                )
                .orderBy(reservation.reservedAt.desc(), reservation.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(
                        reservation.count()
                )
                .from(reservation)
                .join(reservation.assetItem, assetItem)
                .join(assetItem.asset, asset)
                .join(reservation.member, member)
                .where(
                        memberNameEq(condition.getMemberName()),
                        assetNameEq(condition.getAssetName()),
                        reservationStatusEq(condition.getReservationStatus()),
                        reservationDateGoe(condition.getReserveAtFrom()),
                        reservationDateLoe(condition.getReserveAtTo())
                );
        return PageableExecutionUtils.getPage(content, pageable, () -> countQuery.fetchOne());
    }

    private BooleanExpression memberNameEq(String memberName) {
        return hasText(memberName) ? member.name.eq(memberName) : null;
    }

    private BooleanExpression assetNameEq(String assetName) {
        return hasText(assetName) ? asset.name.eq(assetName) : null;
    }

    private BooleanExpression reservationStatusEq(ReservationStatus reservationStatus) {
        return reservationStatus != null ? reservation.reservationStatus.eq(reservationStatus) : null;
    }

    private BooleanExpression reservationDateGoe(LocalDate reserveAtFrom) {
        return reserveAtFrom != null ? reservation.reservedAt.goe(reserveAtFrom) : null;
    }

    private BooleanExpression reservationDateLoe(LocalDate reserveAtTo) {
        return reserveAtTo != null ? reservation.reservedAt.loe(reserveAtTo) : null;
    }
}
