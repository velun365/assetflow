package com.assetflow.loan.repository;

import com.assetflow.loan.Loan;
import com.assetflow.loan.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long>, LoanRepositoryCustom {
    List<Loan> findByMemberId(Long memberId);

    List<Loan> findByLoanStatusAndDueDateBeforeAndReturnDateIsNull(
            LoanStatus loanStatus,
            LocalDate today);
    boolean existsByMemberIdAndAssetItemIdAndLoanStatusIn(
            Long memberId,
            Long assetItemId,
            List<LoanStatus> loanStatuses
    );

}
