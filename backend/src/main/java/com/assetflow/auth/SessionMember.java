package com.assetflow.auth;

import com.assetflow.member.Role;

public class SessionMember {

    private final Long memberId;
    private final String loginId;
    private final String name;
    private final Role role;

    public SessionMember(
            Long memberId,
            String loginId,
            String name,
            Role role
    ) {
        this.memberId = memberId;
        this.loginId = loginId;
        this.name = name;
        this.role = role;
    }

    public Long getMemberId() {
        return memberId;
    }

    public String getLoginId() {
        return loginId;
    }

    public String getName() {
        return name;
    }

    public Role getRole() {
        return role;
    }
}