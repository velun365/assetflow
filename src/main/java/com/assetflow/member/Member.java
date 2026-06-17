package com.assetflow.member;

import com.assetflow.department.Department;
import com.assetflow.loan.Loan;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "member_id")
    private Long id;
    private String loginId;
    private String email;
    private String password;
    private String name;
    @Enumerated(EnumType.STRING)
    private Role role;
    @Enumerated(EnumType.STRING)
    private MemberStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    public void changeDepartment(Department department) {
        this.department = department;
        department.getMembers().add(this);
    }

    public Member(String loginId, String email, String password, String name) {
        this.loginId = loginId;
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = Role.USER;
        this.status = MemberStatus.ACTIVE;
    }
}
