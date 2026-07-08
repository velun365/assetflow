package com.assetflow.reservation.repository;

import com.assetflow.reservation.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class ReservationSearchResponse {
    private Long reservationId;
    private String memberName;
    private String assetName;
    private ReservationStatus reservationStatus;
    private LocalDate reservedAt;
}
