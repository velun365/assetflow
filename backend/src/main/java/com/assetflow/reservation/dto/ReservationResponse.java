package com.assetflow.reservation.dto;

import com.assetflow.reservation.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReservationResponse {
    private Long id;
    private Long memberId;
    private String memberName;
    private Long assetItemId;
    private String assetName;
    private ReservationStatus reservationStatus;
    private LocalDateTime reservedAt;
}
