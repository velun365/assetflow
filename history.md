# AssetFlow 개발일지

## Day 1 - 프로젝트 초기 세팅

### 완료

* Spring Boot 프로젝트 생성
* MySQL 연동
* GitHub 저장소 생성 및 연결

### 목표

* 프로젝트 구조 설계
* 도메인 정의

---

## Day 2 - 도메인 엔티티 설계

### 완료

* Member 엔티티 초안 작성
* Department 엔티티 초안 작성
* Asset 엔티티 초안 작성
* Category 엔티티 초안 작성
* AssetItem 엔티티 초안 작성

### 설계 고민

#### Asset 과 AssetItem 분리

초기에는 Asset 엔티티에 수량(count)을 저장하는 방식을 고려습니다.

하지만 실제 자산은 동일 모델이라도 개별 관리가 필요하다고 판단하여 Asset과 AssetItem을 분리하였다.

예시

* Asset : MacBook Pro 14인치
* AssetItem : MBP-001
* AssetItem : MBP-002

---

## Day 3 - ERD 정리 및 MemberService 구현

### 완료
- ERD 초안 정리
- FK 위치 정리
  - Department 1:N Member
  - Category 1:N Asset
  - Asset 1:N AssetItem
  - Member 1:N Loan
  - AssetItem 1:N Loan
- Member 엔티티에 loginId 추가
- MemberRepository 생성
- MemberService 구현
  - 회원가입
  - 중복 loginId 검증
  - 회원 목록 조회
  - 회원 단건 조회
- MemberServiceTest 작성
  - 회원가입 성공 테스트
  - 중복 회원 예외 테스트

### 오늘 배운 것
- `@ManyToOne` 쪽이 FK를 가진다.
- `@JoinColumn`은 FK 컬럼명을 지정할 때 사용한다.
- `@Column`은 일반 컬럼에 사용한다.
- 단방향 매핑만으로도 Repository 조회가 가능하다.
- 중복 회원 검증은 이름이 아니라 loginId 기준으로 해야 한다.
- `assertThrows`는 예외 발생을 검증하는 테스트다.