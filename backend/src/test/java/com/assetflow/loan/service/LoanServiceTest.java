package com.assetflow.loan.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItem;
import com.assetflow.asset.AssetItemStatus;
import com.assetflow.asset.Category;
import com.assetflow.loan.LoanStatus;
import com.assetflow.loan.dto.LoanCreateRequest;
import com.assetflow.loan.dto.LoanCreateResponse;
import com.assetflow.loan.dto.LoanReturnRequestResponse;
import com.assetflow.loan.dto.LoanReturnResponse;
import com.assetflow.member.Member;
import com.assetflow.reservation.dto.ReservationCreateRequest;
import com.assetflow.reservation.service.ReservationService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Slf4j
@Transactional
class LoanServiceTest {

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
    void 대여하기() {
        //given
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());

        //when
        LoanCreateResponse response = loanService.createLoan(member1, request);

        //then
        assertEquals(
                LoanStatus.RENTED,
                response.getLoanStatus()
        );
        assertEquals(
                AssetItemStatus.RENTED,
                assetItem1.getAssetItemStatus()
        );
    }

    @Test
    void 반납요청하기() {
        //given
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());
        LoanCreateResponse createResponse = loanService.createLoan(member1, request);
        Long loanId = createResponse.getLoanId();

        //when
        LoanReturnRequestResponse returnResponse = loanService.requestReturn(loanId, member1);

        //then
        assertEquals(
                LoanStatus.RETURN_REQUESTED,
                returnResponse.getLoanStatus()
        );
    }

    @Test
    void 반납승인하기() {
        //given
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());
        LoanCreateResponse createResponse = loanService.createLoan(member1, request);
        Long loanId = createResponse.getLoanId();

        loanService.requestReturn(loanId, member1);

        //when
        LoanReturnResponse returnResponse = loanService.approveReturn(loanId);

        //then
        assertEquals(
                LoanStatus.RETURNED,
                returnResponse.getLoanStatus()
        );
        assertEquals(
                AssetItemStatus.AVAILABLE,
                assetItem1.getAssetItemStatus()
        );
    }

    @Test
    void 타인이_반납요청하면_실패() {
        //given
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());
        LoanCreateResponse createResponse = loanService.createLoan(member1, request);
        Long loanId = createResponse.getLoanId();

        //when, then
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> loanService.requestReturn(loanId, member2)
        );

        assertEquals(
                "본인의 대여만 반납 요청할 수 있습니다.",
                exception.getMessage()
        );
    }

    @Test
    void READY_예약자는_대여가능() {
        //given
        //물품아이템
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());

        //대여1
        LoanCreateResponse response1 = loanService.createLoan(member1, request);
        Long loanId = response1.getLoanId();

        //예약
        ReservationCreateRequest reservationCreateRequest = new ReservationCreateRequest(assetItem1.getId());
        reservationService.createReservation(member2, reservationCreateRequest);

        //대여한 물품 반납요청
        loanService.requestReturn(loanId, member1);
        //대여한 물품 반납승인
        loanService.approveReturn(loanId);

        //when
        LoanCreateResponse response2 = loanService.createLoan(member2, request);

        //then
        assertEquals(
                LoanStatus.RENTED,
                response2.getLoanStatus()
        );
        assertEquals(
                AssetItemStatus.RENTED,
                assetItem1.getAssetItemStatus()
        );

    }

    @Test
    void READY_예약자가_아니면_대여할_수_없다(){
        //given
        //물품아이템
        LoanCreateRequest request = new LoanCreateRequest(assetItem1.getId());

        //대여1
        LoanCreateResponse response1 = loanService.createLoan(member1, request);
        Long loanId = response1.getLoanId();

        //예약
        ReservationCreateRequest reservationCreateRequest = new ReservationCreateRequest(assetItem1.getId());
        reservationService.createReservation(member2, reservationCreateRequest);

        //대여한 물품 반납요청
        loanService.requestReturn(loanId, member1);
        //대여한 물품 반납승인
        loanService.approveReturn(loanId);

        //when, then
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> loanService.createLoan(member3, request)
        );

        assertEquals(
                "해당 요청자는 예약자가 아닙니다.",
                exception.getMessage()
        );

    }
}