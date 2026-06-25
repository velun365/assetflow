package com.assetflow.member.controller;

import com.assetflow.member.dto.MemberCreateRequest;
import com.assetflow.member.dto.MemberCreateResponse;
import com.assetflow.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
}
