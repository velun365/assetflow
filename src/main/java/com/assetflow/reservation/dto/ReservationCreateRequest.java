package com.assetflow.reservation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReservationCreateRequest {
        @NotNull
        private Long memberId;
        @NotNull
        private Long assetItemId;
}
