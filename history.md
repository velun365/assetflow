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

## Day 3 - 대여 도메인 및 ERD 설계

### 완료

* Loan 엔티티 설계
* LoanStatus 설계
* AssetItemStatus 설계
* ERD 초안 작성
* 테이블 관계 설계

### ERD 관계

* Department (1) : Member (N)
* Category (1) : Asset (N)
* Asset (1) : AssetItem (N)
* Member (1) : Loan (N)
* AssetItem (1) : Loan (N)

### 설계 고민

#### Loan 분리

대여 이력을 관리하기 위해 Loan 엔티티를 별도로 분리하였다.

관리 항목

* 대여일
* 반납 예정일
* 실제 반납일
* 대여 상태

#### FK 위치 이해

ERD 작성 과정에서 FK가 항상 N측 테이블에 위치한다는 점을 학습하였다.

예시

* Member.department_id
* Asset.category_id
* AssetItem.asset_id
* Loan.member_id
* Loan.asset_item_id
