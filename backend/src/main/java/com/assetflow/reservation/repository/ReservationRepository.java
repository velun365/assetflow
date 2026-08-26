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
    boolean existsByMemberIdAndAssetItemIdAndReservationStatusIn(
            Long memberId,
            Long assetItemId,
            List<ReservationStatus> reservationStatuses
    );

    boolean existsByAssetItemIdAndReservationStatus(
            Long assetItemId,
            ReservationStatus reservationStatus

    );

    boolean existsByAssetItemAssetId(Long assetId);
}
