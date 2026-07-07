package com.assetflow.member.dto;

import com.assetflow.member.MemberStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberSearchResponse {
    private String loginId;
    private String name;
    private MemberStatus status;
    private String departmentName;
}
