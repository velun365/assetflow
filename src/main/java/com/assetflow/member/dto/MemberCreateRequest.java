package com.assetflow.member.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberCreateRequest {
    @NotBlank
    private String loginId;
    @Email
    @NotBlank
    private String email;
    @NotBlank(message = "비밀번호를 입력하세요")
    @Size(min = 8, max = 16, message = "비밀번호는 8~16자로 입력하세요.")
    private String password;
    @NotBlank
    private String name;
}
