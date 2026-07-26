package com.assetflow.department;

import com.assetflow.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Department {
    @Id
    @GeneratedValue
    @Column(name = "department_id")
    private Long id;
    private String name;

    @OneToMany(mappedBy = "department")
    private List<Member> members = new ArrayList<>();


}
