package com.assetflow.loan.repository;

import com.assetflow.loan.dto.LoanSearchCondition;
import com.assetflow.loan.dto.LoanSearchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LoanRepositoryCustom {
    Page<LoanSearchResponse> searchLoan(LoanSearchCondition condition, Pageable pageable);
}
