package com.assetflow;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItem;
import com.assetflow.asset.Category;
import com.assetflow.loan.Loan;
import com.assetflow.member.Member;
import com.assetflow.reservation.Reservation;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Profile("local")
@Component
@RequiredArgsConstructor
public class InitTestData {
    private final InitTestDataService initTestDataService;

    @PostConstruct
    public void init() {
        initTestDataService.init();
    }

    @Component
    static class InitTestDataService {
        @PersistenceContext
        EntityManager em;

        @Transactional
        public void init() {
            // =========================
            // 회원
            // =========================

            Member member1 = new Member(
                    "user1",
                    "user1@naver.com",
                    "test1234",
                    "홍길동"
            );

            Member member2 = new Member(
                    "user2",
                    "user2@naver.com",
                    "test1234",
                    "박길동"
            );

            em.persist(member1);
            em.persist(member2);

            for (int i = 3; i < 50; i++) {
                String name = i % 2 == 0
                        ? "짝수이름"
                        : "홀수이름";

                Member member = new Member(
                        "user" + i,
                        "user" + i + "@naver.com",
                        "test1234",
                        name
                );

                em.persist(member);
            }

            // =========================
            // 카테고리
            // =========================

            Category electronicCategory = new Category("전자기기");
            Category documentCategory = new Category("문서");
            Category bookCategory = new Category("도서");
            Category officeCategory = new Category("사무용품");
            Category furnitureCategory = new Category("가구");

            em.persist(electronicCategory);
            em.persist(documentCategory);
            em.persist(bookCategory);
            em.persist(officeCategory);
            em.persist(furnitureCategory);

            // =========================
            // 자산 종류
            // =========================

            Asset samsungLaptop = new Asset(
                    "삼성 노트북",
                    "업무용 삼성 노트북입니다.",
                    electronicCategory
            );

            Asset macBook = new Asset(
                    "맥북",
                    "디자인 및 개발 업무용 애플 노트북입니다.",
                    electronicCategory
            );

            Asset lgMonitor = new Asset(
                    "LG 모니터",
                    "27인치 QHD 업무용 모니터입니다.",
                    electronicCategory
            );

            Asset galaxyTablet = new Asset(
                    "갤럭시 태블릿",
                    "회의 및 외근용 태블릿입니다.",
                    electronicCategory
            );

            Asset report2025 = new Asset(
                    "2025 결산 자료",
                    "2025년 분기별 결산 내역 문서입니다.",
                    documentCategory
            );

            Asset workManual = new Asset(
                    "2026 업무 매뉴얼",
                    "사내 업무 절차와 규정이 정리된 문서입니다.",
                    documentCategory
            );

            Asset javaBook = new Asset(
                    "자바 학습서",
                    "김영한 Java 학습용 도서입니다.",
                    bookCategory
            );

            Asset springBook = new Asset(
                    "스프링 입문서",
                    "Spring Boot 학습용 도서입니다.",
                    bookCategory
            );

            Asset keyboard = new Asset(
                    "무선 키보드",
                    "사무실 공용 무선 키보드입니다.",
                    officeCategory
            );

            Asset chair = new Asset(
                    "사무용 의자",
                    "회의실 및 업무 공간에서 사용하는 의자입니다.",
                    furnitureCategory
            );

            em.persist(samsungLaptop);
            em.persist(macBook);
            em.persist(lgMonitor);
            em.persist(galaxyTablet);
            em.persist(report2025);
            em.persist(workManual);
            em.persist(javaBook);
            em.persist(springBook);
            em.persist(keyboard);
            em.persist(chair);

            // =========================
            // 개별 자산 품목
            // =========================

            AssetItem samsungLaptop1 = new AssetItem(
                    "SAM-NB-001",
                    "본사 3층",
                    samsungLaptop
            );

            AssetItem samsungLaptop2 = new AssetItem(
                    "SAM-NB-002",
                    "본사 3층",
                    samsungLaptop
            );

            AssetItem samsungLaptop3 = new AssetItem(
                    "SAM-NB-003",
                    "본사 5층",
                    samsungLaptop
            );

            AssetItem macBook1 = new AssetItem(
                    "MAC-001",
                    "본사 4층",
                    macBook
            );

            AssetItem macBook2 = new AssetItem(
                    "MAC-002",
                    "본사 4층",
                    macBook
            );

            AssetItem lgMonitor1 = new AssetItem(
                    "LG-MON-001",
                    "본사 2층",
                    lgMonitor
            );

            AssetItem lgMonitor2 = new AssetItem(
                    "LG-MON-002",
                    "본사 2층",
                    lgMonitor
            );

            AssetItem lgMonitor3 = new AssetItem(
                    "LG-MON-003",
                    "본사 5층",
                    lgMonitor
            );

            AssetItem galaxyTablet1 = new AssetItem(
                    "TAB-001",
                    "본사 4층",
                    galaxyTablet
            );

            AssetItem galaxyTablet2 = new AssetItem(
                    "TAB-002",
                    "본사 4층",
                    galaxyTablet
            );

            AssetItem report2025Item1 = new AssetItem(
                    "DOC-2025-001",
                    "문서보관실",
                    report2025
            );

            AssetItem report2025Item2 = new AssetItem(
                    "DOC-2025-002",
                    "문서보관실",
                    report2025
            );

            AssetItem workManual1 = new AssetItem(
                    "MANUAL-001",
                    "인사팀",
                    workManual
            );

            AssetItem workManual2 = new AssetItem(
                    "MANUAL-002",
                    "총무팀",
                    workManual
            );

            AssetItem javaBook1 = new AssetItem(
                    "BOOK-JAVA-001",
                    "교육실",
                    javaBook
            );

            AssetItem javaBook2 = new AssetItem(
                    "BOOK-JAVA-002",
                    "교육실",
                    javaBook
            );

            AssetItem springBook1 = new AssetItem(
                    "BOOK-SPRING-001",
                    "교육실",
                    springBook
            );

            AssetItem springBook2 = new AssetItem(
                    "BOOK-SPRING-002",
                    "교육실",
                    springBook
            );

            AssetItem springBook3 = new AssetItem(
                    "BOOK-SPRING-003",
                    "교육실",
                    springBook
            );

            AssetItem keyboard1 = new AssetItem(
                    "KEY-001",
                    "본사 3층",
                    keyboard
            );

            AssetItem keyboard2 = new AssetItem(
                    "KEY-002",
                    "본사 3층",
                    keyboard
            );

            AssetItem keyboard3 = new AssetItem(
                    "KEY-003",
                    "본사 5층",
                    keyboard
            );

            AssetItem chair1 = new AssetItem(
                    "CHAIR-001",
                    "회의실 A",
                    chair
            );

            AssetItem chair2 = new AssetItem(
                    "CHAIR-002",
                    "회의실 A",
                    chair
            );

            AssetItem chair3 = new AssetItem(
                    "CHAIR-003",
                    "회의실 B",
                    chair
            );

            em.persist(samsungLaptop1);
            em.persist(samsungLaptop2);
            em.persist(samsungLaptop3);

            em.persist(macBook1);
            em.persist(macBook2);

            em.persist(lgMonitor1);
            em.persist(lgMonitor2);
            em.persist(lgMonitor3);

            em.persist(galaxyTablet1);
            em.persist(galaxyTablet2);

            em.persist(report2025Item1);
            em.persist(report2025Item2);

            em.persist(workManual1);
            em.persist(workManual2);

            em.persist(javaBook1);
            em.persist(javaBook2);

            em.persist(springBook1);
            em.persist(springBook2);
            em.persist(springBook3);

            em.persist(keyboard1);
            em.persist(keyboard2);
            em.persist(keyboard3);

            em.persist(chair1);
            em.persist(chair2);
            em.persist(chair3);

            // =========================
            // 대여 중인 품목 상태 변경
            // =========================

            samsungLaptop1.rentAsset();
            macBook1.rentAsset();
            lgMonitor1.rentAsset();
            galaxyTablet1.rentAsset();
            javaBook1.rentAsset();
            chair1.rentAsset();

            // =========================
            // 대여 기록
            // =========================

            Loan loan1 = new Loan(member1, samsungLaptop1);
            Loan loan2 = new Loan(member2, macBook1);
            Loan loan3 = new Loan(member1, lgMonitor1);
            Loan loan4 = new Loan(member2, galaxyTablet1);
            Loan loan5 = new Loan(member1, javaBook1);
            Loan loan6 = new Loan(member2, chair1);

            em.persist(loan1);
            em.persist(loan2);
            em.persist(loan3);
            em.persist(loan4);
            em.persist(loan5);
            em.persist(loan6);

            // =========================
            // 예약
            // =========================

            Reservation reservation1 = new Reservation(
                    member2,
                    samsungLaptop1
            );

            Reservation reservation2 = new Reservation(
                    member1,
                    macBook1
            );

            Reservation reservation3 = new Reservation(
                    member2,
                    lgMonitor1
            );

            Reservation reservation4 = new Reservation(
                    member1,
                    galaxyTablet1
            );

            Reservation reservation5 = new Reservation(
                    member2,
                    javaBook1
            );

            em.persist(reservation1);
            em.persist(reservation2);
            em.persist(reservation3);
            em.persist(reservation4);
            em.persist(reservation5);
        }


    }
}
