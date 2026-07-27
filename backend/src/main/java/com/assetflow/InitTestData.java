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
            Member member1 = new Member("user1", "user1@naver.com", "test1234", "홍길동");
            Member member2 = new Member("user2", "user2@naver.com", "test1234", "박길동");
            em.persist(member1);
            em.persist(member2);

            for (int i = 3; i < 50; i++) {
                String name = i % 2 == 0 ? "짝수이름" : "홀수이름";
                em.persist(new Member("user" + i, "user" + i + "@naver.com", "test1234", name));
            }

            Category category1 = new Category(
                    "전자기기"
            );
            Category category2 = new Category(
                    "문서"
            );
            Category category3 = new Category(
                    "자료"
            );

            em.persist(category1);
            em.persist(category2);
            em.persist(category3);

            Asset asset1 = new Asset(
                    "삼성 노트북",
                    "이노트북은 삼성 노트북입니다.",
                    category1
            );
            Asset asset2 = new Asset(
                    "맥북",
                    "이노트북은 애플 노트북입니다.",
                    category1

            );
            Asset asset3 = new Asset(
                    "2025자료",
                    "2025 분기결산 내역",
                    category2
            );
            Asset asset4 = new Asset(
                    "이것은 책입니다.",
                    "김영한 java",
                    category3
            );
            em.persist(asset1);
            em.persist(asset2);
            em.persist(asset3);
            em.persist(asset4);

            AssetItem assetItem1 = new AssetItem("SN-001", "본사 3층", asset1);
            AssetItem assetItem2 = new AssetItem("SN-002", "본사 3층", asset1);
            AssetItem assetItem3 = new AssetItem("MB-001", "본사 4층", asset2);

            em.persist(assetItem1);
            em.persist(assetItem2);
            em.persist(assetItem3);

            Loan loan1 = new Loan(member1, assetItem1);
            Loan loan2 = new Loan(member2, assetItem2);
            Loan loan3 = new Loan(member1, assetItem3);

            em.persist(loan1);
            em.persist(loan2);
            em.persist(loan3);

            Reservation reservation1 = new Reservation(member2, assetItem1);
            Reservation reservation2 = new Reservation(member1, assetItem2);

            em.persist(reservation1);
            em.persist(reservation2);


        }


    }
}
