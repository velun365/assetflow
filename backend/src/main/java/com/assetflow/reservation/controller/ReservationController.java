package com.assetflow.reservation.controller;

import com.assetflow.auth.security.CustomUserDetails;
import com.assetflow.member.Member;
import com.assetflow.reservation.dto.MyReservationResponse;
import com.assetflow.reservation.dto.ReservationCreateRequest;
import com.assetflow.reservation.dto.ReservationCreateResponse;
import com.assetflow.reservation.dto.ReservationResponse;
import com.assetflow.reservation.repository.ReservationSearchCondition;
import com.assetflow.reservation.repository.ReservationSearchResponse;
import com.assetflow.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    public ReservationCreateResponse createReservation(
            @Valid @RequestBody ReservationCreateRequest request,
            Authentication authentication
    ) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        Member member = userDetails.getMember();

        return reservationService.createReservation(member, request);
    }

    @GetMapping
    public List<ReservationResponse> getReservations() {
        return reservationService.getReservations();
    }

    @GetMapping("/my")
    public List<MyReservationResponse> findByMyReservations(
            Authentication authentication
    ) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        Member member = userDetails.getMember();

        return reservationService.findByMyReservations(member.getId());
    }

    @PostMapping("/{reservationId}/cancel")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable Long reservationId,
            Authentication authentication
    ) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        Member member = userDetails.getMember();

        reservationService.cancelReservation(reservationId, member);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public Page<ReservationSearchResponse> searchReservation(ReservationSearchCondition condition, Pageable pageable) {
        return reservationService.searchReservation(condition, pageable);
    }

}
