package com.assetflow.member.dto;

import com.assetflow.member.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberMyResponse {
    private Long id;
    private String loginId;
    private String email;
    private String name;
    private Role role;
}