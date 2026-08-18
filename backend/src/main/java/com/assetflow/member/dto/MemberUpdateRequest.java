package com.assetflow.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberUpdateRequest {
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String currentPassword;
}
