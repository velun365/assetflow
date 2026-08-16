package com.assetflow.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberCreateResponse {
    private Long memberId;
    private String loginId;
    private String email;
    private String name;
}
