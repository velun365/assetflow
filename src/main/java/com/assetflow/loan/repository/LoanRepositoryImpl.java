package com.assetflow.loan.repository;

import com.assetflow.loan.LoanStatus;
import com.assetflow.loan.dto.LoanSearchCondition;
import com.assetflow.loan.dto.LoanSearchResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.time.LocalDate;
import java.util.List;

import static com.assetflow.asset.QAsset.asset;
import static com.assetflow.asset.QAssetItem.*;
import static com.assetflow.loan.QLoan.*;
import static com.assetflow.member.QMember.*;
import static org.springframework.util.StringUtils.hasText;

public class LoanRepositoryImpl implements LoanRepositoryCustom{
    private final JPAQueryFactory queryFactory;

    public LoanRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<LoanSearchResponse> searchLoan(LoanSearchCondition condition, Pageable pageable) {
        List<LoanSearchResponse> content = queryFactory
                .select(Projections.constructor(
                        LoanSearchResponse.class,
                        loan.id,
                        loan.loanStatus,
                        member.name,
                        assetItem.id,
                        asset.name,
                        loan.loanDate,
                        loan.dueDate,
                        loan.returnDate
                ))
                .from(loan)
                .join(loan.member, member)
                .join(loan.assetItem, assetItem)
                .join(assetItem.asset, asset)
                .where(
                        loanStatusEq(condition.getLoanStatus()),
                        memberNameEq(condition.getMemberName()),
                        assetItemIdEq(condition.getAssetItemId()),
                        loanDateGoe(condition.getLoanDateFrom()),
                        loanDateLoe(condition.getLoanDateTo())
                )
                .orderBy(loan.loanDate.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(
                        loan.count()
                )
                .from(loan)
                .join(loan.member, member)
                .join(loan.assetItem, assetItem)
                .join(assetItem.asset, asset)
                .where(
                        loanStatusEq(condition.getLoanStatus()),
                        memberNameEq(condition.getMemberName()),
                        assetItemIdEq(condition.getAssetItemId()),
                        loanDateGoe(condition.getLoanDateFrom()),
                        loanDateLoe(condition.getLoanDateTo())
                );

        return PageableExecutionUtils.getPage(content, pageable, () -> countQuery.fetchOne());
    }

    private BooleanExpression loanStatusEq(LoanStatus loanStatus) {
        return loanStatus != null ? loan.loanStatus.eq(loanStatus) : null;
    }

    private BooleanExpression memberNameEq(String memberName) {
        return hasText(memberName) ? member.name.eq(memberName) : null;
    }

    private BooleanExpression assetItemIdEq(Long assetItemId) {
        return assetItemId != null ? assetItem.id.eq(assetItemId) : null;
    }


    private BooleanExpression loanDateGoe(LocalDate loanDateFrom) {
        return loanDateFrom != null ? loan.loanDate.goe(loanDateFrom) : null;
    }

    private BooleanExpression loanDateLoe(LocalDate loanDateTo) {
        return loanDateTo != null ? loan.loanDate.loe(loanDateTo) : null;
    }
}
