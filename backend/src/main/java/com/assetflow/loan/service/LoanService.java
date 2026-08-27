package com.assetflow.loan.service;

import com.assetflow.asset.AssetItem;
import com.assetflow.asset.AssetItemStatus;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.loan.Loan;
import com.assetflow.loan.LoanStatus;
import com.assetflow.loan.dto.*;
import com.assetflow.loan.repository.LoanRepository;
import com.assetflow.member.Member;
import com.assetflow.member.repository.MemberRepository;
import com.assetflow.reservation.Reservation;
import com.assetflow.reservation.ReservationStatus;
import com.assetflow.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoanService {
    private static final ZoneId SEOUL_ZONE = ZoneId.of("Asia/Seoul");

    private final LoanRepository loanRepository;
    private final AssetItemRepository assetItemRepository;
    private final ReservationRepository reservationRepository;

    @Transactional
    public LoanCreateResponse createLoan(Member member,LoanCreateRequest request) {
        AssetItem assetItem = assetItemRepository.findById(request.getAssetItemId())
                .orElseThrow(() -> new IllegalStateException("존재 하지 않는 자산 품목입니다."));

        // 자산이 대출 가능한 상태인지 검증
        if (assetItem.getAssetItemStatus() == AssetItemStatus.AVAILABLE) {
            completeReadyReservation(member, assetItem);

            assetItem.rentAsset();

            Loan loan = new Loan(
                    member,
                    assetItem
            );
            loanRepository.save(loan);
            return new LoanCreateResponse(
                    loan.getId(),
                    loan.getLoanStatus(),
                    member.getId(),
                    request.getAssetItemId(),
                    loan.getLoanDate(),
                    loan.getDueDate(),
                    loan.getReturnDate()
            );
        }
        throw new IllegalStateException("대출이 불가 합니다.");
    }
    @Transactional
    public LoanReturnRequestResponse requestReturn(Long loanId, Member member) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new IllegalStateException("해당 대여 기록이 존재하지 않습니다."));

        if (!loan.getMember().getId().equals(member.getId())) {
            throw new IllegalStateException("본인의 대여만 반납 요청할 수 있습니다.");
        }

        loan.requestReturn();

        return new LoanReturnRequestResponse(
                loan.getId(),
                loan.getLoanStatus()
        );
    }

    @Transactional
    public LoanReturnResponse approveReturn(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new IllegalStateException("해당 대여 기록이 존재하지 않습니다."));

        AssetItem assetItem = loan.getAssetItem();

        loan.approveReturn();

        reservationRepository
                .findFirstByAssetItemIdAndReservationStatusOrderByReservedAtAscIdAsc(
                        assetItem.getId(),
                        ReservationStatus.WAITING
                )
                .ifPresent(Reservation::ready);

        assetItem.returnAsset();

        return new LoanReturnResponse(
                loan.getId(),
                loan.getLoanStatus(),
                loan.getMember().getId(),
                assetItem.getId(),
                loan.getReturnDate()
        );
    }

    private void completeReadyReservation(Member member, AssetItem assetItem) {
        reservationRepository
                .findFirstByAssetItemIdAndReservationStatusOrderByReservedAtAscIdAsc(
                        assetItem.getId(),
                        ReservationStatus.READY
                )
                .ifPresent(reservation -> {
                    if (!reservation.getMember().getId().equals(member.getId())) {
                        throw new IllegalStateException(
                                "해당 요청자는 예약자가 아닙니다."
                        );
                    }

                    reservation.completed();
                });
    }

    //전체 조회
    public List<LoanListResponse> listAll() {
        return loanRepository.findAll().stream()
                .map(loan -> new LoanListResponse(
                        loan.getId(),
                        loan.getLoanStatus(),

                        loan.getMember().getId(),
                        loan.getMember().getName(),

                        loan.getAssetItem().getId(),
                        loan.getAssetItem().getAsset().getName(),
                        loan.getAssetItem().getSerialNumber(),

                        loan.getLoanDate(),
                        loan.getDueDate(),
                        loan.getReturnDate()
                ))
                .toList();
    }

    public List<MyLoanListResponse> findLoansByMember(Long memberId) {
        List<Loan> loans = loanRepository.findByMemberId(memberId);

        return loans.stream()
                .map(loan -> new MyLoanListResponse(
                        loan.getId(),
                        loan.getLoanStatus(),
                        loan.getAssetItem().getId(),
                        loan.getAssetItem().getAsset().getName(),
                        loan.getAssetItem().getSerialNumber(),
                        loan.getLoanDate(),
                        loan.getDueDate(),
                        loan.getReturnDate()
                ))
                .toList();
    }

    @Transactional
    @Scheduled(cron = "0 0 0 * * *",
            zone = "Asia/Seoul")
    public void updateOverdueLoan() {
        List<Loan> overLoans = loanRepository.findByLoanStatusAndDueDateBeforeAndReturnDateIsNull(
                LoanStatus.RENTED, LocalDate.now(SEOUL_ZONE)
        );
        overLoans.forEach(loan -> loan.markOverdue());
    }

    public Page<LoanSearchResponse> searchLoan(LoanSearchCondition condition, Pageable pageable) {
        return loanRepository.searchLoan(condition, pageable);
    }
}
