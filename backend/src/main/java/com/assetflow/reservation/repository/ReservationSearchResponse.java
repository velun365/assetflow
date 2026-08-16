package com.assetflow.reservation.repository;

import com.assetflow.reservation.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReservationSearchResponse {
    private Long reservationId;
    private String memberName;
    private String assetName;
    private ReservationStatus reservationStatus;
    private LocalDateTime reservedAt;
}
