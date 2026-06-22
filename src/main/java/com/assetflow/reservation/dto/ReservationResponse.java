package com.assetflow.reservation.dto;

import com.assetflow.reservation.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class ReservationResponse {
    private Long id;
    private Long memberId;
    private Long assertItem;
    private ReservationStatus reservationStatus;
    private LocalDate reservedAt;
}
