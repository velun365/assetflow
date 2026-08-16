package com.assetflow.member.repository;

import com.assetflow.member.dto.MemberSearchCondition;
import com.assetflow.member.dto.MemberSearchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MemberRepositoryCustom {
    List<MemberSearchResponse> search(MemberSearchCondition memberSearchCondition);
    Page<MemberSearchResponse> searchComplex(MemberSearchCondition memberSearchCondition, Pageable pageable);

}
