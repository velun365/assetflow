package com.assetflow;

import com.assetflow.member.Member;
import com.assetflow.member.dto.MemberCreateRequest;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.PersistenceContexts;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Profile("test")
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

        }
    }
}
