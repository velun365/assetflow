package com.assetflow.member.service;

import com.assetflow.member.Member;
import com.assetflow.member.dto.MemberCreateRequest;
import com.assetflow.member.repository.MemberRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.util.ReflectionTestUtils;

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

//        Long join1 = memberService.join(member1);

//        Assertions.assertEquals(member1, memberService.findOne(join1));

    }

    @Test
    public void 중복테스트() {
        MemberCreateRequest member1 = createRequest(
                "test01", "test1@test.com", "test1234", "홍길동"
        );
        MemberCreateRequest member2 = createRequest(
                "test01", "test2@test.com", "test1234", "박길동"
        );

        memberService.join(member1);

        Assertions.assertThrows(
                IllegalStateException.class,
                () -> memberService.join(member2)
        );
    }

    private MemberCreateRequest createRequest(
            String loginId,
            String email,
            String password,
            String name
    ) {
        MemberCreateRequest request = new MemberCreateRequest();
        ReflectionTestUtils.setField(request, "loginId", loginId);
        ReflectionTestUtils.setField(request, "email", email);
        ReflectionTestUtils.setField(request, "password", password);
        ReflectionTestUtils.setField(request, "name", name);
        return request;
    }
}
