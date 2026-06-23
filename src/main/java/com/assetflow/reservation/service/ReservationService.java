package com.assetflow.reservation.service;

import com.assetflow.asset.AssetItem;
import com.assetflow.asset.AssetItemStatus;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.member.Member;
import com.assetflow.member.repository.MemberRepository;
import com.assetflow.reservation.Reservation;
import com.assetflow.reservation.dto.MyReservationResponse;
import com.assetflow.reservation.dto.ReservationCreateRequest;
import com.assetflow.reservation.dto.ReservationCreateResponse;
import com.assetflow.reservation.dto.ReservationResponse;
import com.assetflow.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final MemberRepository memberRepository;
    private final AssetItemRepository assetItemRepository;

    @Transactional
    public ReservationCreateResponse createReservation(ReservationCreateRequest request) {
        AssetItem assetItem = assetItemRepository.findById(request.getAssetItemId())
                .orElseThrow(() -> new IllegalStateException("자산 목록이 존재 하지 않습니다."));
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalStateException("해당 회원은 존재하지 않는 회원입니다."));

        if (assetItem.getAssetItemStatus() == AssetItemStatus.RENTED) {
            Reservation reservation = new Reservation(
                    member, assetItem
            );
            reservationRepository.save(reservation);
            return new ReservationCreateResponse(
                    reservation.getId(),
                    member.getId(),
                    assetItem.getId(),
                    reservation.getReservationStatus(),
                    reservation.getReservedAt()
            );
        }
        throw new IllegalStateException("대여중인 자산만 예약 할 수 있습니다.");

    }

    public List<ReservationResponse> getReservations() {
        return reservationRepository.findAll()
                .stream().map(
                        history -> new ReservationResponse(
                                history.getId(),
                                history.getMember().getId(),
                                history.getAssetItem().getId(),
                                history.getReservationStatus(),
                                history.getReservedAt()
                        )
                )
                .toList();

    }

    public List<MyReservationResponse> findByMyReservations(Long memberId) {
        return reservationRepository.findByMemberId(memberId)
                .stream().map(
                        reservation -> new MyReservationResponse(
                                reservation.getId(),
                                reservation.getAssetItem().getId(),
                                reservation.getReservationStatus(),
                                reservation.getReservedAt()
                        ))
                    .toList();

    }

    @Transactional
    public void cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalStateException("존재 하지 않는 예약입니다."));

        reservation.cancel();

    }


}
