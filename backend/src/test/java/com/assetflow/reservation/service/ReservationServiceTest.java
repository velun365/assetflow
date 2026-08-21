package com.assetflow.reservation.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItem;
import com.assetflow.asset.Category;
import com.assetflow.loan.dto.LoanCreateRequest;
import com.assetflow.loan.dto.LoanCreateResponse;
import com.assetflow.loan.service.LoanService;
import com.assetflow.member.Member;
import com.assetflow.reservation.Reservation;
import com.assetflow.reservation.ReservationStatus;
import com.assetflow.reservation.dto.ReservationCreateRequest;
import com.assetflow.reservation.dto.ReservationCreateResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Slf4j
@Transactional
class ReservationServiceTest {

    @PersistenceContext
    EntityManager em;

    @Autowired
    LoanService loanService;

    @Autowired
    ReservationService reservationService;

    Member member1;
    Member member2;
    Member member3;
    AssetItem assetItem1;

    @BeforeEach
    void init() {
        //초기값
        member1 = new Member(
                "testid1",
                "testid1@gmail.com",
                "test1234",
                "테스터1"
        );
        member2 = new Member(
                "testid2",
                "testid2@gmail.com",
                "test1234",
                "테스터2"
        );
        member3 = new Member(
                "testid3",
                "testid3@gmail.com",
                "test1234",
                "테스터3"
        );
        em.persist(member1);
        em.persist(member2);
        em.persist(member3);

        Category category1 = new Category("전자기기");
        em.persist(category1);

        Asset asset1 = new Asset("테스트노트북", "테스트물품", category1);
        em.persist(asset1);

        assetItem1 = new AssetItem("test-000", "테스트실 1층", asset1);
        em.persist(assetItem1);
    }

    @Test
    void 대여중인_자산_예약가능() {
        //given
        //물품아이템
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());

        //대여
        loanService.createLoan(member1, request);

        //when
        // 예약
        ReservationCreateRequest reservationCreateRequest = new ReservationCreateRequest(assetItem1.getId());
        ReservationCreateResponse reservation = reservationService.createReservation(member2, reservationCreateRequest);

        //then
        assertEquals(
                ReservationStatus.WAITING,
                reservation.getReservationStatus()
        );

    }

    @Test
    void 중복_예약실패() {
        //given
        //물품아이템
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());

        //대여
        loanService.createLoan(member1, request);

        // 처음 예약
        ReservationCreateRequest reservationCreateRequest = new ReservationCreateRequest(assetItem1.getId());
        reservationService.createReservation(member2, reservationCreateRequest);

        //when, then
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> reservationService.createReservation(member2, reservationCreateRequest)
        );

        assertEquals(
                "중복 예약은 불가 합니다.",
                exception.getMessage()
        );

    }

    @Test
    void 본인_대여품목_예약_실패() {
        //given
        //물품아이템
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());

        //대여
        loanService.createLoan(member1, request);

        //when
        // 예약
        ReservationCreateRequest reservationCreateRequest = new ReservationCreateRequest(assetItem1.getId());

        //then
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> reservationService.createReservation(member1, reservationCreateRequest)
        );

        assertEquals(
                "본인이 대여 중인 자산은 예약할 수 없습니다.",
                exception.getMessage()
        );

    }

    @Test
    void 대여중이_아닌자산은_예약할수없다() {
        //given,when,then
        // 예약
        ReservationCreateRequest reservationCreateRequest = new ReservationCreateRequest(assetItem1.getId());

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> reservationService.createReservation(member1, reservationCreateRequest)
        );

        assertEquals(
                "대여중인 자산만 예약 할 수 있습니다.",
                exception.getMessage()
        );

    }

    @Test
    void READY_예약을_취소하면_다음예약이_READY로_변환() {
        //given
        //물품아이템
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());

        //대여
        LoanCreateResponse loan = loanService.createLoan(member1, request);

        //예약
        ReservationCreateRequest reservationCreateRequest = new ReservationCreateRequest(assetItem1.getId());
        ReservationCreateResponse reservation1 = reservationService.createReservation(member2, reservationCreateRequest);
        ReservationCreateResponse reservation2 = reservationService.createReservation(member3, reservationCreateRequest);

        //반납요청
        loanService.requestReturn(loan.getLoanId(), member1);
        //반납승인
        loanService.approveReturn(loan.getLoanId());
        //when
        //예약취소
        reservationService.cancelReservation(reservation1.getReservationId(), member2);
        Reservation canceledReservation = em.find(Reservation.class, reservation1.getReservationId());
        Reservation nextReservation = em.find(Reservation.class, reservation2.getReservationId());

        //then
        assertEquals(
                ReservationStatus.CANCELED,
                canceledReservation.getReservationStatus()
        );

        assertEquals(
                ReservationStatus.READY,
                nextReservation.getReservationStatus()
        );

    }

}