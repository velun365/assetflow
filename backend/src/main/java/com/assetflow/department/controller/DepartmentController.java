package com.assetflow.department.controller;

import com.assetflow.department.dto.DepartmentRequest;
import com.assetflow.department.dto.DepartmentResponse;
import com.assetflow.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public List<DepartmentResponse> findDepartments() {
        return departmentService.findDepartments();
    }

    @PostMapping
    public DepartmentResponse createDepartment(
            @Valid @RequestBody DepartmentRequest request
    ) {
        return departmentService.createDepartment(request);
    }

    @PatchMapping("/{departmentId}")
    public void updateDepartment(
            @PathVariable Long departmentId,
            @Valid @RequestBody DepartmentRequest request
    ) {
        departmentService.updateDepartment(departmentId, request);
    }

    @DeleteMapping("/{departmentId}")
    public void deleteDepartment(@PathVariable Long departmentId) {
        departmentService.deleteDepartment(departmentId);
    }
}
