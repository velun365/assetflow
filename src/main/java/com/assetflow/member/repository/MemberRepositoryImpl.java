package com.assetflow.member.repository;

import com.assetflow.member.MemberStatus;
import com.assetflow.member.dto.MemberSearchCondition;
import com.assetflow.member.dto.MemberSearchResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;

import static com.assetflow.department.QDepartment.*;
import static com.assetflow.member.QMember.*;
import static org.springframework.util.StringUtils.*;

public class MemberRepositoryImpl implements MemberRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    public MemberRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public List<MemberSearchResponse> search(MemberSearchCondition condition) {
        return queryFactory
                .select(Projections.constructor(
                        MemberSearchResponse.class,
                        member.id,
                        member.loginId,
                        member.name,
                        member.status,
                        department.name
                ))
                .from(member)
                .leftJoin(member.department, department)
                .where(
                        loginIdEq(condition.getLoginId()),
                        nameEq(condition.getName()),
                        statusEq(condition.getStatus()),
                        departmentNameEq(condition.getDepartmentName())

                )
                .fetch();
    }


    @Override
    public Page<MemberSearchResponse> searchComplex(MemberSearchCondition condition, Pageable pageable) {
        List<MemberSearchResponse> content = queryFactory
                .select(Projections.constructor(
                        MemberSearchResponse.class,
                        member.id,
                        member.loginId,
                        member.name,
                        member.status,
                        department.name
                ))
                .from(member)
                .leftJoin(member.department, department)
                .where(
                        loginIdEq(condition.getLoginId()),
                        nameEq(condition.getName()),
                        statusEq(condition.getStatus()),
                        departmentNameEq(condition.getDepartmentName())

                )
                .orderBy(member.id.desc(), member.name.asc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(member.count())
                .from(member)
                .leftJoin(member.department, department)
                .where(
                        loginIdEq(condition.getLoginId()),
                        nameEq(condition.getName()),
                        statusEq(condition.getStatus()),
                        departmentNameEq(condition.getDepartmentName())

                );
        return PageableExecutionUtils.getPage(content, pageable, () -> countQuery.fetchOne());
    }


    private BooleanExpression loginIdEq(String loginId) {
        return hasText(loginId) ? member.loginId.eq(loginId) : null;
    }

    private BooleanExpression nameEq(String name) {
        return hasText(name) ? member.name.eq(name) : null;
    }
    private BooleanExpression statusEq(MemberStatus status) {
        return status != null ? member.status.eq(status) : null;
    }

    private BooleanExpression departmentNameEq(String departmentName) {
        return hasText(departmentName) ? department.name.eq(departmentName) : null;
    }


}
