package com.assetflow.reservation.repository;

import com.assetflow.reservation.ReservationStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReservationSearchCondition {
    private String memberName;
    private String assetName;
    private ReservationStatus reservationStatus;
    private LocalDate reserveAtFrom;
    private LocalDate reserveAtTo;
}
