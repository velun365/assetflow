package com.assetflow.reservation.repository;

import com.assetflow.reservation.Reservation;
import com.assetflow.reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long>, ReservationRepositoryCustom {
    List<Reservation> findByMemberId(Long memberId);

    Optional<Reservation> findFirstByAssetItemIdAndReservationStatusOrderByReservedAtAscIdAsc(
            Long assetItemId,
            ReservationStatus reservationStatus
    );
    boolean existsByMemberIdAndAssetItemIdAndReservationStatus(
            Long memberId,
            Long assetItemId,
            ReservationStatus reservationStatus
    );
}
