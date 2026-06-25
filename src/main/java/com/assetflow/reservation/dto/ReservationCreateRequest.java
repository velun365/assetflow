package com.assetflow.reservation.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReservationCreateRequest {
        @NotBlank
        private Long memberId;
        @NotBlank
        private Long assetItemId;
}
