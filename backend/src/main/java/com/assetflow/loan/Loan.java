package com.assetflow.loan;

import com.assetflow.asset.AssetItem;
import com.assetflow.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Loan {
    @Id
    @GeneratedValue
    @Column(name = "loan_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    private LoanStatus loanStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_item_id")
    private AssetItem assetItem;

    private static final int RENTAL_PERIOD = 14;

    private LocalDate loanDate; //빌린날짜
    private LocalDate dueDate; //반납예정일
    private LocalDate returnDate; //실제반납일

    public Loan(Member member, AssetItem assetItem) {
        this.loanStatus = LoanStatus.RENTED;
        this.member = member;
        this.assetItem = assetItem;
        this.loanDate = LocalDate.now();
        this.dueDate = this.loanDate.plusDays(RENTAL_PERIOD);
    }

    public void requestReturn() {
        if (this.loanStatus != LoanStatus.RENTED
                && this.loanStatus != LoanStatus.OVERDUE) {
            throw new IllegalStateException("대여 중인 자산만 반납 요청할 수 있습니다.");
        }

        this.loanStatus = LoanStatus.RETURN_REQUESTED;
    }

    public void approveReturn() {
        if (this.loanStatus != LoanStatus.RETURN_REQUESTED) {
            throw new IllegalStateException("반납 요청 상태인 대여만 승인할 수 있습니다.");
        }

        this.returnDate = LocalDate.now();
        this.loanStatus = LoanStatus.RETURNED;
    }

    public void markOverdue() {
        if (this.loanStatus == LoanStatus.RENTED) {
            this.loanStatus = LoanStatus.OVERDUE;
        }
    }










}
