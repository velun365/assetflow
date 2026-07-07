package com.assetflow.member.dto;

import com.assetflow.member.MemberStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberSearchCondition {
    private String loginId;
    private String name;
    private MemberStatus status;
    private String departmentName;
}
