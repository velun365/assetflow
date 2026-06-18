package com.assetflow.member.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberCreateRequest {
    private String loginId;
    private String email;
    private String password;
    private String name;
}
