package com.assetflow.loan.controller;

import com.assetflow.auth.security.CustomUserDetails;
import com.assetflow.loan.dto.*;
import com.assetflow.loan.service.LoanService;
import com.assetflow.member.Member;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
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
    public LoanCreateResponse createLoan(@Valid @RequestBody LoanCreateRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Member member = userDetails.getMember();

        return loanService.createLoan(member, request);
    }

    // 회원 반납 요청
    @PostMapping("/{loanId}/return-request")
    public LoanReturnRequestResponse requestReturn(
            @PathVariable Long loanId,
            Authentication authentication
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Member member = userDetails.getMember();

        return loanService.requestReturn(loanId, member);
    }

    // 관리자 반납 승인
    @PostMapping("/{loanId}/return-approve")
    public LoanReturnResponse approveReturn(@PathVariable Long loanId) {
        return loanService.approveReturn(loanId);
    }

    // 회원별 대여 조회
    // 내 대여 조회
    @GetMapping("/my")
    public List<MyLoanListResponse> loanListByMember(
            Authentication authentication
    ) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        Member member = userDetails.getMember();

        return loanService.findLoansByMember(member.getId());
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