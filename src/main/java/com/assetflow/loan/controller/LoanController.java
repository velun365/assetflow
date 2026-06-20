package com.assetflow.loan.controller;

import com.assetflow.loan.dto.LoanCreateRequest;
import com.assetflow.loan.dto.LoanCreateResponse;
import com.assetflow.loan.dto.LoanReturnResponse;
import com.assetflow.loan.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/loans")
public class LoanController {
    private final LoanService loanService;

    @PostMapping
    public LoanCreateResponse loanCreate(@RequestBody LoanCreateRequest request) {
        return loanService.createLoan(request);
    }

    @PostMapping("/{loanId}/return")
    public LoanReturnResponse loanReturn(@PathVariable("loanId") Long loanId) {
        return loanService.returnLoan(loanId);
    }
}
