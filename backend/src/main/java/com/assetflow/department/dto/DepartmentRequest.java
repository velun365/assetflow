package com.assetflow.department.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class DepartmentRequest {
    @NotBlank(message = "부서명을 입력해주세요.")
    private String name;
}
