# AssetFlow

## 프로젝트 소개

AssetFlow는 기업/기관 내부에서 도서, 문서, 장비 등의 자산을 등록하고, 직원들에게 대여·예약·반납·연체·요청 처리를 제공하는 백오피스 시스템입니다.

단순 물품 관리 서비스가 아니라, 사내 자산의 상태와 대여 흐름을 관리하는 업무 시스템을 목표로 합니다.

## 주요 기능

- 회원 및 부서 관리
- 자산 등록 및 관리
- 개별 자산 품목 관리
- 자산 대여 및 반납 처리
- 사용자별 대여 이력 조회
- 관리자용 대여 현황 관리
- 예약 대기열 및 예약 취소 처리
- 연체 상태 자동 갱신
- 사용자 반납 요청 및 관리자 승인

## 기술 스택

- Java 17
- Spring Boot 3.5.15
- Spring Data JPA
- Spring Security
- Querydsl
- MySQL
- Gradle
- Lombok
- React
- Vite

## ERD 구조

👉 [ERD Cloud에서 직접 보기](https://www.erdcloud.com/d/Yf7AwmwtrBS72ohqz)

![ERD](./erd1.png)

## 개발 기록

상세 개발 과정과 설계 고민은 [HISTORY.md](./history.md)에 정리합니다.

## 현재 진행 상황

- [x] Spring Boot 프로젝트 생성
- [x] MySQL 연결
- [x] GitHub 저장소 연결
- [x] 핵심 도메인 엔티티 초안 작성
- [x] ERD 초안 작성
- [x] Repository 및 검색 기능 구현
- [x] 회원가입 및 세션 로그인 구현
- [x] 역할별 접근 제어 구현
- [x] 자산 및 자산 품목 관리 구현
- [x] 대여·반납 요청·승인 구현
- [x] 예약 생성·조회·취소 구현

## 2026-08-21 - 테스트 환경 분리 및 대여/예약 핵심 테스트 정비

### 테스트 DB 분리

기존에는 main과 test가 모두 같은 MySQL `assetflow` DB를 사용하고 있었고,
`ddl-auto: create` 설정 때문에 테스트 실행 시 개발 DB가 초기화될 위험이 있었다.

이를 방지하기 위해 테스트 전용 DB를 별도로 생성했다.

- 개발 DB: `assetflow`
- 테스트 DB: `assetflow_test`

설정도 다음과 같이 분리했다.

- main `ddl-auto: update`
- test `ddl-auto: create-drop`

테스트는 `src/test/resources/application.yml`을 사용해
`assetflow_test` DB에서만 실행되도록 했다.

`create-drop`은 테스트 시작 시 스키마를 생성하고,
테스트 종료 시 테스트용 테이블을 제거한다.

### 테스트 데이터 구성 방식 변경

기존 테스트용 대량 초기 데이터를 사용하는 방식 대신,
각 ServiceTest에서 테스트에 필요한 최소 엔티티만 직접 생성하도록 변경했다.

예:

- Member
- Category
- Asset
- AssetItem

테스트 클래스에 `@Transactional`을 적용해
각 테스트 종료 후 변경 내용을 rollback하도록 했다.

`EntityManager.persist()`를 사용해 테스트에 필요한 엔티티를
영속성 컨텍스트의 관리 상태로 만든 뒤 실제 Service 로직을 호출했다.

### 영속성 컨텍스트 복습

`new Entity()`만 한 객체는 일반 자바 객체이며 JPA 관리 대상이 아니다.

`em.persist(entity)`를 호출하면 해당 엔티티가 영속성 컨텍스트의 관리 대상이 된다.

영속 상태의 엔티티는 트랜잭션 안에서 값이 변경되면
dirty checking을 통해 DB에 반영될 수 있다.

반면 Response DTO는 특정 시점의 값을 복사한 객체이기 때문에
엔티티 상태가 이후 변경되어도 자동으로 갱신되지 않는다.

예:

- `AssetItem` Entity → 상태 변경 후 현재 상태 확인 가능
- `LoanCreateResponse` DTO → 생성 당시 `RENTED` 상태를 계속 보유

상태 변경 이후 실제 엔티티 값을 확인해야 하는 테스트에서는
`EntityManager.find()`로 엔티티를 조회해 검증했다.

### LoanService 핵심 테스트

단순 조회 테스트보다 실제 업무 규칙이 있는 상태 전이와 권한/소유권 검증을 우선했다.

검증한 시나리오:

1. 대여 성공
   - AVAILABLE AssetItem 대여
   - LoanStatus → RENTED
   - AssetItemStatus → RENTED

2. 반납 요청
   - RENTED → RETURN_REQUESTED

3. 반납 승인
   - RETURN_REQUESTED → RETURNED
   - AssetItem → AVAILABLE

4. 타인의 반납 요청 차단
   - 다른 Member가 대여자의 Loan을 반납 요청하면 예외 발생
   - Role 권한과 별개로 데이터 소유권 검사가 필요함을 확인

5. READY 예약자의 대여 성공
   - 기존 사용자 대여
   - 다른 사용자 예약 → WAITING
   - 기존 사용자 반납 승인 → 예약 READY
   - READY 예약자가 대여하면 Loan RENTED

6. READY 예약자가 아닌 사용자의 대여 차단
   - READY 예약자가 존재할 때 다른 사용자가 같은 AssetItem을 대여하면 예외 발생

### ReservationService 핵심 테스트

검증한 시나리오:

1. 대여 중인 자산 예약 성공
   - RENTED AssetItem 예약 시 WAITING 상태로 Reservation 생성

2. 중복 예약 차단
   - 동일 Member가 동일 AssetItem에 WAITING/READY 예약을 다시 만들면 예외 발생

3. 본인이 대여 중인 자산 예약 차단
   - 자신의 Loan이 활성 상태인 AssetItem은 예약 불가

4. 대여 중이 아닌 자산 예약 차단
   - AVAILABLE 상태 AssetItem은 예약 불가

5. READY 예약 취소 후 다음 예약자 승격
   - member2 WAITING
   - member3 WAITING
   - 반납 승인 후 member2 READY
   - member2 취소
   - member2 → CANCELED
   - member3 → READY

이 테스트는 단순 CRUD가 아니라 예약 대기열과 상태 전이가
실제 의도대로 연결되는지 검증하기 위해 작성했다.

### 테스트 결과

Gradle 전체 테스트 실행:

````bash
.\gradlew.bat test



## 2026-08-21 - 테스트 환경 분리 및 대여/예약 핵심 테스트 정비

### 테스트 DB 분리

기존에는 main과 test가 모두 같은 MySQL `assetflow` DB를 사용하고 있었고,
`ddl-auto: create` 설정 때문에 테스트 실행 시 개발 DB가 초기화될 위험이 있었다.

이를 방지하기 위해 테스트 전용 DB를 별도로 생성했다.

- 개발 DB: `assetflow`
- 테스트 DB: `assetflow_test`

설정도 다음과 같이 분리했다.

- main `ddl-auto: update`
- test `ddl-auto: create-drop`

테스트는 `src/test/resources/application.yml`을 사용해
`assetflow_test` DB에서만 실행되도록 했다.

`create-drop`은 테스트 시작 시 스키마를 생성하고,
테스트 종료 시 테스트용 테이블을 제거한다.

### 테스트 데이터 구성 방식 변경

기존 테스트용 대량 초기 데이터를 사용하는 방식 대신,
각 ServiceTest에서 테스트에 필요한 최소 엔티티만 직접 생성하도록 변경했다.

예:

- Member
- Category
- Asset
- AssetItem

테스트 클래스에 `@Transactional`을 적용해
각 테스트 종료 후 변경 내용을 rollback하도록 했다.

`EntityManager.persist()`를 사용해 테스트에 필요한 엔티티를
영속성 컨텍스트의 관리 상태로 만든 뒤 실제 Service 로직을 호출했다.

### 영속성 컨텍스트 복습

`new Entity()`만 한 객체는 일반 자바 객체이며 JPA 관리 대상이 아니다.

`em.persist(entity)`를 호출하면 해당 엔티티가 영속성 컨텍스트의 관리 대상이 된다.

영속 상태의 엔티티는 트랜잭션 안에서 값이 변경되면
dirty checking을 통해 DB에 반영될 수 있다.

반면 Response DTO는 특정 시점의 값을 복사한 객체이기 때문에
엔티티 상태가 이후 변경되어도 자동으로 갱신되지 않는다.

예:

- `AssetItem` Entity → 상태 변경 후 현재 상태 확인 가능
- `LoanCreateResponse` DTO → 생성 당시 `RENTED` 상태를 계속 보유

상태 변경 이후 실제 엔티티 값을 확인해야 하는 테스트에서는
`EntityManager.find()`로 엔티티를 조회해 검증했다.

### LoanService 핵심 테스트

단순 조회 테스트보다 실제 업무 규칙이 있는 상태 전이와 권한/소유권 검증을 우선했다.

검증한 시나리오:

1. 대여 성공
   - AVAILABLE AssetItem 대여
   - LoanStatus → RENTED
   - AssetItemStatus → RENTED

2. 반납 요청
   - RENTED → RETURN_REQUESTED

3. 반납 승인
   - RETURN_REQUESTED → RETURNED
   - AssetItem → AVAILABLE

4. 타인의 반납 요청 차단
   - 다른 Member가 대여자의 Loan을 반납 요청하면 예외 발생
   - Role 권한과 별개로 데이터 소유권 검사가 필요함을 확인

5. READY 예약자의 대여 성공
   - 기존 사용자 대여
   - 다른 사용자 예약 → WAITING
   - 기존 사용자 반납 승인 → 예약 READY
   - READY 예약자가 대여하면 Loan RENTED

6. READY 예약자가 아닌 사용자의 대여 차단
   - READY 예약자가 존재할 때 다른 사용자가 같은 AssetItem을 대여하면 예외 발생

### ReservationService 핵심 테스트

검증한 시나리오:

1. 대여 중인 자산 예약 성공
   - RENTED AssetItem 예약 시 WAITING 상태로 Reservation 생성

2. 중복 예약 차단
   - 동일 Member가 동일 AssetItem에 WAITING/READY 예약을 다시 만들면 예외 발생

3. 본인이 대여 중인 자산 예약 차단
   - 자신의 Loan이 활성 상태인 AssetItem은 예약 불가

4. 대여 중이 아닌 자산 예약 차단
   - AVAILABLE 상태 AssetItem은 예약 불가

5. READY 예약 취소 후 다음 예약자 승격
   - member2 WAITING
   - member3 WAITING
   - 반납 승인 후 member2 READY
   - member2 취소
   - member2 → CANCELED
   - member3 → READY

이 테스트는 단순 CRUD가 아니라 예약 대기열과 상태 전이가
실제 의도대로 연결되는지 검증하기 위해 작성했다.

### 테스트 결과

Gradle 전체 테스트 실행:

```bash
.\gradlew.bat test
````
