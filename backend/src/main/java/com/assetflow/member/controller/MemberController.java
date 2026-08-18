package com.assetflow.member.controller;

import com.assetflow.auth.security.CustomUserDetails;
import com.assetflow.member.Member;
import com.assetflow.member.dto.*;
import com.assetflow.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberController {
    private final MemberService memberService;

    @PostMapping
    public MemberCreateResponse join(@Valid @RequestBody MemberCreateRequest request) {
        return memberService.join(request);
    }

    @GetMapping("/search")
    public Page<MemberSearchResponse> searchMembers(MemberSearchCondition condition, Pageable pageable) {
        return memberService.searchMembers(condition, pageable);
    }

    @GetMapping("/me")
    public MemberMyResponse getMyInfo(Authentication authentication){
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Member member = userDetails.getMember();
        return memberService.getMyInfo(member);
    }

    @PatchMapping("/me")
    public void updateMyInfo(
            @Valid @RequestBody MemberUpdateRequest request,
            Authentication authentication){
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Member member = userDetails.getMember();
        memberService.updateMyInfo(member, request);
    }

    @PatchMapping("/me/password")
    public void changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            Authentication authentication
    ) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        Member member = userDetails.getMember();
        memberService.changePassword(member, request);
    }
}
