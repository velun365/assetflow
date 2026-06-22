package com.assetflow.reservation.dto;

import com.assetflow.reservation.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class MyReservationResponse {
    private Long id;
    private Long assertItem;
    private ReservationStatus reservationStatus;
    private LocalDate reservedAt;


}
