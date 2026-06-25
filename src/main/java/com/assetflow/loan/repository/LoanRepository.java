package com.assetflow.loan.repository;

import com.assetflow.loan.Loan;
import com.assetflow.loan.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static com.assetflow.loan.LoanStatus.*;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByMemberId(Long memberId);

    List<Loan> findByLoanStatusAndDueDateBeforeAndReturnDateIsNull(
            LoanStatus loanStatus,
            LocalDate today);
    boolean existsByMemberIdAndAssetItemIdAndLoanStatus(
            Long memberId,
            Long assetItemId,
            LoanStatus loanStatus
    );
}
