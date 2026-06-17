package com.assetflow.member.service;

import com.assetflow.member.Member;
import com.assetflow.member.repository.MemberRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest
@Slf4j
@Transactional
class MemberServiceTest {
    @Autowired
    MemberRepository memberRepository;
    @Autowired
    MemberService memberService;

    @Test
    public void 회원가입() {
        Member member1 = new Member("test01", "test1@test.com", "1234", "홍길동");

        Long join1 = memberService.join(member1);

        Assertions.assertEquals(member1, memberService.findOne(join1));

    }

    @Test
    public void 중복테스트() {
        Member member1 = new Member("test01", "test1@test.com", "1234", "홍길동");

        Member member2 = new Member("test01", "test2@test.com", "1234", "박길동");

        memberService.join(member1);
//        try {
//            memberService.join(member2);
//        } catch (IllegalStateException e) {
//            return;
//        }

//        fail("예외가 발생해야합니다.");
//
        Assertions.assertThrows(IllegalStateException.class, () -> {
            memberService.join(member2);
        });
    }
}