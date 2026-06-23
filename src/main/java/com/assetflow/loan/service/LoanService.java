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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoanService {
    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;
    private final AssetItemRepository assetItemRepository;
    private final ReservationRepository reservationRepository;

    @Transactional
    public LoanCreateResponse createLoan(LoanCreateRequest request) {
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 회원입니다."));
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
                    request.getMemberId(),
                    request.getAssetItemId(),
                    loan.getLoanDate(),
                    loan.getDueDate(),
                    loan.getReturnDate()
            );
        }
        throw new IllegalStateException("대출이 불가 합니다.");
    }

    private void completeReadyReservation(Member member, AssetItem assetItem) {
        List<Reservation> reservations = getReadyReservationsByAsset(assetItem);
        if (!reservations.isEmpty()) {
            Reservation reservation = reservations.get(0);
            if (!reservation.getMember().getId().equals(member.getId())) {
                throw new IllegalStateException("해당 요청자는 예약자가 아닙니다.");
            }
            reservation.completed();
        }
    }

    private List<Reservation> getReadyReservationsByAsset(AssetItem assetItem) {
        return reservationRepository.findByAssetItemIdAndReservationStatusOrderByReservedAtAsc(
                assetItem.getId(), ReservationStatus.READY);
    }

    @Transactional
    public LoanReturnResponse returnLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new IllegalStateException("해당 대여 기록이 존재하지 않습니다."));

        AssetItem assetItem = loan.getAssetItem();

        if (loan.getLoanStatus() == LoanStatus.RENTED) {
            loan.returnLoan();

            List<Reservation> reservations =
                    reservationRepository.findByAssetItemIdAndReservationStatusOrderByReservedAtAsc(
                            assetItem.getId(), ReservationStatus.WAITING);

            if (!reservations.isEmpty()) {
                Reservation reservation = reservations.get(0);
                reservation.ready();
            }

            assetItem.returnAsset();
            return new LoanReturnResponse(
                    loan.getId(),
                    loan.getLoanStatus(),
                    loan.getMember().getId(),
                    loan.getAssetItem().getId(),
                    loan.getReturnDate()
            );

        }
        throw new IllegalStateException("이미 반납된 대여 입니다.");

    }

    //전체 조회
    public List<LoanListResponse> listAll() {
        return loanRepository.findAll().stream()
                .map(loan -> new LoanListResponse(
                        loan.getId(),
                        loan.getLoanStatus(),
                        loan.getMember().getId(),
                        loan.getAssetItem().getId(),
                        loan.getLoanDate(),
                        loan.getDueDate(),
                        loan.getReturnDate()
                ))
                .toList();
    }

    public List<MyLoanListResponse> findLoansByMember(Long memberId) {
        return loanRepository.findByMemberId(memberId).stream()
                .map(loan -> new MyLoanListResponse(
                        loan.getId(),
                        loan.getLoanStatus(),
                        loan.getMember().getId(),
                        loan.getLoanDate(),
                        loan.getDueDate(),
                        loan.getReturnDate()
                ))
                .toList();
    }

    @Transactional
    @Scheduled(cron = "0 0 0 * * *")
    public void updateOverdueLoan() {
        List<Loan> overLoans = loanRepository.findByLoanStatusAndDueDateBeforeAndReturnDateIsNull(
                LoanStatus.RENTED, LocalDate.now()
        );
        overLoans.forEach(loan -> loan.markOverdue());
    }

}