package com.assetflow.member.service;

import com.assetflow.member.Member;
import com.assetflow.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;

    @Transactional
    public Long join(Member member) {
        validateDuplicateMember(member);
        memberRepository.save(member);
        return member.getId();
    }

    private void validateDuplicateMember(Member member) {
        List<Member> findLoginId = memberRepository.findByLoginId(member.getLoginId());
        if (!findLoginId.isEmpty()) {
            throw new IllegalStateException("이미 존재 하는 회원입니다.");
        }
    }

    public List<Member> findMembers() {
        return memberRepository.findAll();
    }

    public Member findOne(Long loginId) {
        return memberRepository.findById(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. id=" + loginId));
    }


}
