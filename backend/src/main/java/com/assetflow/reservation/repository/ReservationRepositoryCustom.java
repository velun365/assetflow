package com.assetflow.reservation.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReservationRepositoryCustom {
    Page<ReservationSearchResponse> searchReservation(ReservationSearchCondition condition, Pageable pageable);
}
