package com.assetflow.member.dto;

import com.assetflow.member.MemberStatus;
import com.assetflow.member.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class MemberAdminUpdateRequest {

    private Long departmentId;

    @NotNull
    private MemberStatus status;
}