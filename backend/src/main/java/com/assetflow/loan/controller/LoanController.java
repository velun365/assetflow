package com.assetflow.loan.controller;

import com.assetflow.loan.dto.*;
import com.assetflow.loan.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    // 전체 조회
    @GetMapping
    public List<LoanListResponse> loanAll() {
        return loanService.listAll();
    }

    // 대여 생성
    @PostMapping
    public LoanCreateResponse createLoan(@Valid @RequestBody LoanCreateRequest request) {
        return loanService.createLoan(request);
    }

    // 회원 반납 요청
    @PostMapping("/{loanId}/return-request")
    public LoanReturnRequestResponse requestReturn(
            @PathVariable Long loanId,
            @RequestParam Long memberId
    ) {
        return loanService.requestReturn(loanId, memberId);
    }

    // 관리자 반납 승인
    @PostMapping("/{loanId}/return-approve")
    public LoanReturnResponse approveReturn(@PathVariable Long loanId) {
        return loanService.approveReturn(loanId);
    }

    // 회원별 대여 조회
    @GetMapping("/members/{memberId}")
    public List<MyLoanListResponse> loanListByMember(@PathVariable Long memberId) {
        return loanService.findLoansByMember(memberId);
    }

    // 검색
    @GetMapping("/search")
    public Page<LoanSearchResponse> searchLoan(
            LoanSearchCondition condition,
            Pageable pageable
    ) {
        return loanService.searchLoan(condition, pageable);
    }
}