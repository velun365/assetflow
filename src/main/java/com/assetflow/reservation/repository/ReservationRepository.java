package com.assetflow.reservation.repository;

import com.assetflow.reservation.Reservation;
import com.assetflow.reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByMemberId(Long memberId);

    List<Reservation> findByAssetItemIdAndReservationStatusOrderByReservedAtAsc(
            Long assetItemId,
            ReservationStatus reservationStatus
    );
}
