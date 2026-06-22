package com.assetflow.reservation.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReservationCreateRequest {
        private Long memberId;
        private Long assetItemId;
}
