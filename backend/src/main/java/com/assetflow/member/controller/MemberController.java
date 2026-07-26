package com.assetflow.member.controller;

import com.assetflow.member.dto.MemberCreateRequest;
import com.assetflow.member.dto.MemberCreateResponse;
import com.assetflow.member.dto.MemberSearchCondition;
import com.assetflow.member.dto.MemberSearchResponse;
import com.assetflow.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
