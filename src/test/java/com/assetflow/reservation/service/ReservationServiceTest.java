package com.assetflow.reservation.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItem;
import com.assetflow.asset.AssetType;
import com.assetflow.asset.Category;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.asset.repository.CategoryRepository;
import com.assetflow.loan.dto.LoanCreateRequest;
import com.assetflow.loan.service.LoanService;
import com.assetflow.member.Member;
import com.assetflow.member.repository.MemberRepository;
import com.assetflow.reservation.ReservationStatus;
import com.assetflow.reservation.dto.MyReservationResponse;
import com.assetflow.reservation.dto.ReservationCreateRequest;
import com.assetflow.reservation.dto.ReservationCreateResponse;
import com.assetflow.reservation.dto.ReservationResponse;
import com.assetflow.reservation.repository.ReservationRepository;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@Slf4j
@Transactional
class ReservationServiceTest {
    @Autowired
    MemberRepository memberRepository;
    @Autowired
    CategoryRepository categoryRepository;
    @Autowired
    AssetRepository assetRepository;

    @Autowired
    AssetItemRepository assetItemRepository;

    @Autowired
    LoanService loanService;

    @Autowired
    ReservationRepository reservationRepository;

    @Autowired
    ReservationService reservationService;

    @Test
    void createReservation() {
        TestData data = testReady();
        LoanCreateRequest loanMember = new LoanCreateRequest(
                data.member1.getId(),
                data.assetItem1.getId()
        );

        loanService.createLoan(loanMember);
        ReservationCreateRequest request1 = new ReservationCreateRequest(
                data.member2.getId(),
                data.assetItem1.getId()
        );
        ReservationCreateRequest request2 = new ReservationCreateRequest(
                data.member1.getId(),
                data.assetItem1.getId()
        );

        ReservationCreateResponse reservation1 = reservationService.createReservation(request1);

        Assertions.assertThat(reservation1.getMemberId()).isEqualTo(request1.getMemberId());
        Assertions.assertThat(reservation1.getReservationStatus()).isEqualTo(ReservationStatus.WAITING);

        Assertions.assertThatThrownBy(() -> reservationService.createReservation(request2))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("본인이 대여 중인 자산은 예약할 수 없습니다.");

        Assertions.assertThatThrownBy(() -> reservationService.createReservation(request1))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("중복 예약은 불가 합니다.");
    }

    @Test
    void 대여중이_아닌_자산은_예약할수없다() {
        TestData data = testReady();
        ReservationCreateRequest request = new ReservationCreateRequest(
                data.member2.getId(),
                data.assetItem1.getId()
        );

        Assertions.assertThatThrownBy(() -> reservationService.createReservation(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("대여중인 자산만 예약 할 수 있습니다.");

    }

    @Test
    void getReservations() {
        TestData data = testReady();
        LoanCreateRequest loanMember = new LoanCreateRequest(
                data.member1.getId(),
                data.assetItem1.getId()
        );
        loanService.createLoan(loanMember);

        ReservationCreateRequest request1 = new ReservationCreateRequest(
                data.member2.getId(),
                data.assetItem1.getId()
        );
        ReservationCreateResponse reservation1 = reservationService.createReservation(request1);

        List<ReservationResponse> reservations = reservationService.getReservations();
        Assertions.assertThat(reservations).hasSize(1);
        Assertions.assertThat(reservations.get(0).getReservationStatus()).isEqualTo(ReservationStatus.WAITING);
        Assertions.assertThat(reservations.get(0).getMemberId()).isEqualTo(data.member2.getId());
    }

    @Test
    void findByMyReservations() {
        TestData data = testReady();
        LoanCreateRequest loanMember = new LoanCreateRequest(
                data.member1.getId(),
                data.assetItem1.getId()
        );
        loanService.createLoan(loanMember);

        ReservationCreateRequest request1 = new ReservationCreateRequest(
                data.member2.getId(),
                data.assetItem1.getId()
        );
        ReservationCreateResponse reservation1 = reservationService.createReservation(request1);

        List<MyReservationResponse> byMyReservations = reservationService.findByMyReservations(data.member2.getId());

        Assertions.assertThat(byMyReservations).hasSize(1);
        Assertions.assertThat(byMyReservations.get(0).getId()).isEqualTo(reservation1.getId());
        Assertions.assertThat(byMyReservations.get(0).getReservationStatus()).isEqualTo(ReservationStatus.WAITING);

    }

    @Test
    void cancelReservation() {
        TestData data = testReady();
        LoanCreateRequest loanMember = new LoanCreateRequest(
                data.member1.getId(),
                data.assetItem1.getId()
        );
        loanService.createLoan(loanMember);

        ReservationCreateRequest request1 = new ReservationCreateRequest(
                data.member2.getId(),
                data.assetItem1.getId()
        );
        ReservationCreateResponse reservation1 = reservationService.createReservation(request1);

        reservationService.cancelReservation(reservation1.getId());

        List<MyReservationResponse> byMyReservations = reservationService.findByMyReservations(reservation1.getMemberId());
        Assertions.assertThat(byMyReservations.get(0).getReservationStatus()).isEqualTo(ReservationStatus.CANCELED);


    }

    @Test
    void 존재하지않는_예약_취소_테스트() {
        Long testId = 99L;
        Assertions.assertThatThrownBy(() -> reservationService.cancelReservation(testId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("존재 하지 않는 예약입니다.");
    }

    private TestData testReady() {
        Member member1 = new Member(
                "test01",
                "test01@naver.com",
                "test123456",
                "김철수"
        );
        Member member2 = new Member(
                "test02",
                "test02@naver.com",
                "test123456",
                "신짱구"
        );
        Category category1 = new Category(
                "전자기기"
        );

        Asset asset1 = new Asset(
                "삼성",
                "이것은 갤럭시 핸드폰입니다.",
                AssetType.DEVICE
        );
        asset1.changeCategory(category1);

        AssetItem assetItem1 = new AssetItem(
                "SM-510",
                "1층 전산실",
                asset1
        );

        memberRepository.save(member1);
        memberRepository.save(member2);
        categoryRepository.save(category1);
        assetRepository.save(asset1);
        assetItemRepository.save(assetItem1);

        return new TestData(member1, member2, assetItem1);
    }

    private static class TestData {
        Member member1;
        Member member2;
        AssetItem assetItem1;

        TestData(Member member1, Member member2, AssetItem assetItem1) {
            this.member1 = member1;
            this.member2 = member2;
            this.assetItem1 = assetItem1;
        }
    }
}