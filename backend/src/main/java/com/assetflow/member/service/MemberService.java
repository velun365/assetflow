package com.assetflow.member.service;

import com.assetflow.member.Member;
import com.assetflow.member.dto.*;
import com.assetflow.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MemberCreateResponse join(MemberCreateRequest request) {
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Member member = new Member(
                request.getLoginId(),
                request.getEmail(),
                encodedPassword,
                request.getName());
        validateDuplicateLoginId(member.getLoginId());
        memberRepository.save(member);
        return new MemberCreateResponse(
                member.getId(),member.getLoginId(), member.getEmail(), member.getName()
        );
    }

    private void validateDuplicateLoginId(String loginId) {
        Optional<Member> findMember = memberRepository.findByLoginId(loginId);
        if (findMember.isPresent()) {
            throw new IllegalStateException("이미 존재 하는 회원입니다.");
        }
    }

    public List<Member> findMembers() {
        return memberRepository.findAll();
    }

    public Member findOne(String loginId) {
        return memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. loginId=" + loginId));
    }

    public Page<MemberSearchResponse> searchMembers(MemberSearchCondition condition, Pageable pageable) {
        return memberRepository.searchComplex(condition, pageable);
    }

    @Transactional
    public void updateMyInfo(Member member, MemberUpdateRequest request){
        Member managedMember = memberRepository.findById(member.getId())
                .orElseThrow(() -> new IllegalStateException("존재하지않는 회원입니다."));
        if(!passwordEncoder.matches(
                request.getCurrentPassword(),
                managedMember.getPassword()
        )){
            throw new IllegalStateException("현재 비밀번호가 일치하지 않습니다.");
        }
        managedMember.updateInfo(
                request.getEmail()
        );
    }
    @Transactional
    public void changePassword(Member member, PasswordChangeRequest request) {

        Member managedMember = memberRepository.findById(member.getId())
                .orElseThrow(() ->
                        new IllegalStateException("존재하지 않는 회원입니다."));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                managedMember.getPassword()
        )) {
            throw new IllegalStateException("현재 비밀번호가 일치하지 않습니다.");
        }

        String encodedPassword =
                passwordEncoder.encode(request.getNewPassword());

        managedMember.changePassword(encodedPassword);
    }

    public MemberMyResponse getMyInfo(Member member) {
        Member managedMember = memberRepository.findById(member.getId())
                .orElseThrow(() ->
                        new IllegalStateException("존재하지 않는 회원입니다."));

        return new MemberMyResponse(
                managedMember.getId(),
                managedMember.getLoginId(),
                managedMember.getEmail(),
                managedMember.getName(),
                managedMember.getRole()
        );
    }
}
