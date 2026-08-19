package com.assetflow.department.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DepartmentResponse {

    private Long departmentId;
    private String name;
}