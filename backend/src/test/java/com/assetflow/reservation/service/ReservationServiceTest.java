package com.assetflow.reservation.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItem;
import com.assetflow.asset.Category;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.asset.repository.CategoryRepository;
import com.assetflow.loan.dto.LoanCreateRequest;
import com.assetflow.loan.service.LoanService;
import com.assetflow.member.Member;
import com.assetflow.member.repository.MemberRepository;
import com.assetflow.reservation.Reservation;
import com.assetflow.reservation.ReservationStatus;
import com.assetflow.reservation.dto.MyReservationResponse;
import com.assetflow.reservation.dto.ReservationCreateRequest;
import com.assetflow.reservation.dto.ReservationCreateResponse;
import com.assetflow.reservation.dto.ReservationResponse;
import com.assetflow.reservation.repository.ReservationRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Slf4j
@Transactional
class ReservationServiceTest {
    @PersistenceContext
    EntityManager em;

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

        assertThat(reservation1.getMemberId()).isEqualTo(request1.getMemberId());
        assertThat(reservation1.getReservationStatus()).isEqualTo(ReservationStatus.WAITING);

        assertThatThrownBy(() -> reservationService.createReservation(request2))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("본인이 대여 중인 자산은 예약할 수 없습니다.");

        assertThatThrownBy(() -> reservationService.createReservation(request1))
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

        assertThatThrownBy(() -> reservationService.createReservation(request))
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
        assertThat(reservations).hasSize(1);
        assertThat(reservations.get(0).getReservationStatus()).isEqualTo(ReservationStatus.WAITING);
        assertThat(reservations.get(0).getMemberId()).isEqualTo(data.member2.getId());
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

        assertThat(byMyReservations).hasSize(1);
        assertThat(byMyReservations.get(0).getReservationId()).isEqualTo(reservation1.getReservationId());
        assertThat(byMyReservations.get(0).getReservationStatus()).isEqualTo(ReservationStatus.WAITING);

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

        reservationService.cancelReservation(reservation1.getReservationId());

        List<MyReservationResponse> byMyReservations = reservationService.findByMyReservations(reservation1.getMemberId());
        assertThat(byMyReservations.get(0).getReservationStatus()).isEqualTo(ReservationStatus.CANCELED);


    }

    @Test
    void 존재하지않는_예약_취소_테스트() {
        Long testId = 99L;
        assertThatThrownBy(() -> reservationService.cancelReservation(testId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("존재하지 않는 예약입니다.");
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
                category1
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

    @Test
    void readly_예약취소시_다음_wating_예약이_ready(){
        //given
        Member member1 = new Member(
                "aaa01",
                "test01@naver.com",
                "test123456",
                "가철수"
        );
        Member member2 = new Member(
                "aaa02",
                "test02@naver.com",
                "test123456",
                "나짱구"
        );

        Member member3 = new Member(
                "aaa03",
                "test03@naver.com",
                "test1234456",
                "다유리"
        );

        Category category = new Category("전자기기");
        Asset asset = new Asset(
                "삼성 노트북",
                "설명",
                category
        );
        AssetItem assetItem =
                new AssetItem(
                        "SN-001",
                        "3층",
                        asset
                );
        em.persist(member1);
        em.persist(member2);
        em.persist(member3);

        em.persist(category);
        em.persist(asset);
        em.persist(assetItem);

        Reservation reservation1 =
                new Reservation(member1, assetItem);

        Reservation reservation2 =
                new Reservation(member2, assetItem);

        Reservation reservation3 =
                new Reservation(member3, assetItem);

        reservation1.ready();

        em.persist(reservation1);
        em.persist(reservation2);
        em.persist(reservation3);

        em.flush();
        em.clear();

        reservationService.cancelReservation(
                reservation1.getId()
        );

        Reservation canceledReservation =
                em.find(Reservation.class, reservation1.getId());

        Reservation readyReservation =
                em.find(Reservation.class, reservation2.getId());

        Reservation waitingReservation =
                em.find(Reservation.class, reservation3.getId());

        assertThat(canceledReservation.getReservationStatus())
                .isEqualTo(ReservationStatus.CANCELED);

        assertThat(readyReservation.getReservationStatus())
                .isEqualTo(ReservationStatus.READY);

        assertThat(waitingReservation.getReservationStatus())
                .isEqualTo(ReservationStatus.WAITING);


    }


    @Test
    void waiting_예약_취소시_다른_waiting_예약은_그대로다() {
        // given
        Member member1 = new Member(
                "bbb01",
                "waiting01@naver.com",
                "test123456",
                "가철수"
        );

        Member member2 = new Member(
                "bbb02",
                "waiting02@naver.com",
                "test123456",
                "나짱구"
        );

        Member member3 = new Member(
                "bbb03",
                "waiting03@naver.com",
                "test123456",
                "다유리"
        );

        Category category = new Category("전자기기");

        Asset asset = new Asset(
                "LG 노트북",
                "테스트용 노트북",
                category
        );

        AssetItem assetItem = new AssetItem(
                "LG-TEST-001",
                "본사 3층",
                asset
        );

        em.persist(member1);
        em.persist(member2);
        em.persist(member3);
        em.persist(category);
        em.persist(asset);
        em.persist(assetItem);

        Reservation reservation1 =
                new Reservation(member1, assetItem);

        Reservation reservation2 =
                new Reservation(member2, assetItem);

        Reservation reservation3 =
                new Reservation(member3, assetItem);

        em.persist(reservation1);
        em.persist(reservation2);
        em.persist(reservation3);

        em.flush();
        em.clear();

        // when
        reservationService.cancelReservation(reservation1.getId());

        // then
        Reservation canceledReservation =
                em.find(Reservation.class, reservation1.getId());

        Reservation secondReservation =
                em.find(Reservation.class, reservation2.getId());

        Reservation thirdReservation =
                em.find(Reservation.class, reservation3.getId());

        assertThat(canceledReservation.getReservationStatus())
                .isEqualTo(ReservationStatus.CANCELED);

        assertThat(secondReservation.getReservationStatus())
                .isEqualTo(ReservationStatus.WAITING);

        assertThat(thirdReservation.getReservationStatus())
                .isEqualTo(ReservationStatus.WAITING);
    }
}
