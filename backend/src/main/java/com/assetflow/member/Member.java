package com.assetflow.member;

import com.assetflow.department.Department;
import com.assetflow.loan.Loan;
import com.assetflow.reservation.Reservation;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
    @Column(nullable = false, unique = true)
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

    @OneToMany(mappedBy = "member")
    private List<Reservation> reservations = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    private List<Loan> loans = new ArrayList<>();


    public void changeDepartment(Department department) {
        if (this.department != null) {
            this.department.getMembers().remove(this);
        }

        this.department = department;

        if (department != null) {
            department.getMembers().add(this);
        }
    }


    public void changeStatus(MemberStatus status) {
        this.status = status;
    }

    public Member(String loginId, String email, String password, String name) {
        this.loginId = loginId;
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = Role.USER;
        this.status = MemberStatus.ACTIVE;
    }

    public void updateInfo(String email) {
        this.email = email;
    }

    public void changePassword(String password) {
        this.password = password;
    }
}
