package com.assetflow.member.repository;

import com.assetflow.member.Member;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Slf4j
@Transactional
class MemberRepositoryTest {
    @Autowired
    MemberRepository memberRepository;

    @Test
    public void 테스트() {

        Member member1 = new Member("test01", "test1@test.com", "1234", "홍길동");
        Member member2 = new Member("test02", "test2@test.com", "1234", "홍길동");
        Member member3 = new Member("test03", "test3@test.com", "1234", "홍길동");
        Member member4 = new Member("test04", "test4@test.com", "1234", "홍길동");
        Member member5 = new Member("test05", "test5@test.com", "1234", "홍길동");

        memberRepository.save(member1);
//        memberRepository.save(member2);
//        memberRepository.save(member3);

        Long findId = memberRepository.findById(member1.getId()).get().getId();
        Assertions.assertThat(findId).isEqualTo(member1.getId());

        String loginId = memberRepository.findById(member1.getId()).get().getLoginId();
        Assertions.assertThat(loginId).isEqualTo("test01");
    }
}