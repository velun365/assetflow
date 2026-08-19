package com.assetflow.department.service;

import com.assetflow.department.Department;
import com.assetflow.department.dto.DepartmentRequest;
import com.assetflow.department.dto.DepartmentResponse;
import com.assetflow.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentResponse> findDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(department -> new DepartmentResponse(
                        department.getId(),
                        department.getName()
                ))
                .toList();
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {

        if (departmentRepository.existsByName(request.getName())) {
            throw new IllegalStateException("이미 존재하는 부서입니다.");
        }

        Department department = new Department(request.getName());

        departmentRepository.save(department);

        return new DepartmentResponse(
                department.getId(),
                department.getName()
        );
    }

    @Transactional
    public void updateDepartment(Long departmentId, DepartmentRequest request) {

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new IllegalStateException("존재하지 않는 부서입니다."));

        if (!department.getName().equals(request.getName())
                && departmentRepository.existsByName(request.getName())) {
            throw new IllegalStateException("이미 존재하는 부서입니다.");
        }

        department.changeName(request.getName());
    }

    @Transactional
    public void deleteDepartment(Long departmentId) {

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new IllegalStateException("존재하지 않는 부서입니다."));

        if (!department.getMembers().isEmpty()) {
            throw new IllegalStateException(
                    "소속 회원이 존재하는 부서는 삭제할 수 없습니다."
            );
        }

        departmentRepository.delete(department);
    }
}
