package com.assetflow.reservation.dto;

import com.assetflow.reservation.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReservationCreateResponse {
    private Long reservationId;
    private Long memberId;
    private Long assetItemId;
    private ReservationStatus reservationStatus;
    private LocalDateTime reservedAt;
}
