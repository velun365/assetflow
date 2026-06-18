package com.assetflow.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
public class MemberCreateResponse {
    private String loginId;
    private String email;
    private String name;
}
