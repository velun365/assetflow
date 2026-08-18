package com.assetflow.reservation.service;

import com.assetflow.asset.AssetItem;
import com.assetflow.asset.AssetItemStatus;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.loan.LoanStatus;
import com.assetflow.loan.repository.LoanRepository;
import com.assetflow.member.Member;
import com.assetflow.member.repository.MemberRepository;
import com.assetflow.reservation.Reservation;
import com.assetflow.reservation.ReservationStatus;
import com.assetflow.reservation.dto.MyReservationResponse;
import com.assetflow.reservation.dto.ReservationCreateRequest;
import com.assetflow.reservation.dto.ReservationCreateResponse;
import com.assetflow.reservation.dto.ReservationResponse;
import com.assetflow.reservation.repository.ReservationRepository;
import com.assetflow.reservation.repository.ReservationSearchCondition;
import com.assetflow.reservation.repository.ReservationSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final AssetItemRepository assetItemRepository;
    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public ReservationCreateResponse createReservation(
            Member member,
            ReservationCreateRequest request
    ) {
        AssetItem assetItem = assetItemRepository.findById(request.getAssetItemId())
                .orElseThrow(() -> new IllegalStateException("자산 목록이 존재 하지 않습니다."));
        Member managedMember = memberRepository.findById(member.getId())
                .orElseThrow(() -> new IllegalStateException("회원이 존재하지 않습니다."));

        if (assetItem.getAssetItemStatus() == AssetItemStatus.RENTED) {
            boolean alreadyBorrowed = isAlreadyBorrowed(managedMember, assetItem);
            if (alreadyBorrowed) {
                throw new IllegalStateException("본인이 대여 중인 자산은 예약할 수 없습니다.");
            }

            boolean duplicateReservation = hasActiveReservation(managedMember, assetItem);

            if (duplicateReservation) {
                throw new IllegalStateException("중복 예약은 불가 합니다.");
            }

            Reservation reservation = new Reservation(
                    managedMember, assetItem
            );

            reservationRepository.save(reservation);

            return new ReservationCreateResponse(
                    reservation.getId(),
                    managedMember.getId(),
                    assetItem.getId(),
                    reservation.getReservationStatus(),
                    reservation.getReservedAt()
            );
        }

        throw new IllegalStateException("대여중인 자산만 예약 할 수 있습니다.");
    }

    private boolean hasActiveReservation(Member member, AssetItem assetItem) {
        return reservationRepository.existsByMemberIdAndAssetItemIdAndReservationStatusIn(
                member.getId(),
                assetItem.getId(),
                List.of(
                        ReservationStatus.WAITING,
                        ReservationStatus.READY
                )
        );
    }
    private boolean isAlreadyBorrowed(Member member, AssetItem assetItem) {
        return loanRepository.existsByMemberIdAndAssetItemIdAndLoanStatusIn(
                member.getId(),
                assetItem.getId(),
                List.of(
                        LoanStatus.RENTED,
                        LoanStatus.OVERDUE,
                        LoanStatus.RETURN_REQUESTED
                )
        );
    }

    public List<ReservationResponse> getReservations() {
        return reservationRepository.findAll()
                .stream().map(
                        reservation -> new ReservationResponse(
                                reservation.getId(),
                                reservation.getMember().getId(),
                                reservation.getMember().getName(),
                                reservation.getAssetItem().getId(),
                                reservation.getAssetItem().getAsset().getName(),
                                reservation.getReservationStatus(),
                                reservation.getReservedAt()
                        )
                )
                .toList();

    }

    public List<MyReservationResponse> findByMyReservations(Long memberId) {
        return reservationRepository.findByMemberId(memberId)
                .stream()
                .map(reservation -> new MyReservationResponse(
                        reservation.getId(),
                        reservation.getAssetItem().getId(),
                        reservation.getAssetItem().getAsset().getName(),
                        reservation.getAssetItem().getSerialNumber(),
                        reservation.getReservationStatus(),
                        reservation.getReservedAt()
                ))
                .toList();
    }

    @Transactional
    public void cancelReservation(Long reservationId, Member member) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new IllegalStateException("존재하지 않는 예약입니다."));

        if (!reservation.getMember().getId().equals(member.getId())) {
            throw new IllegalStateException("본인의 예약만 취소할 수 있습니다.");
        }

        ReservationStatus previousStatus =
                reservation.getReservationStatus();

        reservation.cancel();

        if (previousStatus == ReservationStatus.READY) {
            reservationRepository
                    .findFirstByAssetItemIdAndReservationStatusOrderByReservedAtAscIdAsc(
                            reservation.getAssetItem().getId(),
                            ReservationStatus.WAITING
                    )
                    .ifPresent(Reservation::ready);
        }
    }
    public Page<ReservationSearchResponse> searchReservation(ReservationSearchCondition condition, Pageable pageable) {
        return reservationRepository.searchReservation(condition, pageable);
    }
}