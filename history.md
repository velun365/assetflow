# AssetFlow 개발일지

> 이 문서는 구현 내역뿐 아니라 **당시의 설계 고민, 실수, 트러블슈팅, 복습 포인트**를 남기는 개인 학습 기록이다.  
> 초기 기록의 일부 내용은 이후 구조 개선으로 변경되었을 수 있으므로, 실제 현재 구조는 뒤쪽의 최신 날짜 기록을 우선해서 본다.

## 빠르게 복습할 핵심 주제

- **JPA**: 연관관계, LAZY, 영속성 컨텍스트, dirty checking, detached/managed
- **Spring Security**: 세션 인증, `Authentication`, `SecurityContext`, CSRF, Role과 Ownership
- **Querydsl**: 동적 검색, DTO projection, count query, 페이징
- **비즈니스 로직**: 대여/반납 상태 전이, 예약 WAITING/READY 우선권
- **테스트**: Given-When-Then, `assertThrows`, 테스트 DB 분리, 핵심 상태 전이 검증
- **프론트 연동**: React Router, AuthContext, ProtectedRoute, fetch/CSRF, 관리자/사용자 UI 분리

---

## Day 1 - 프로젝트 초기 세팅

### 완료

- Spring Boot 프로젝트 생성
- MySQL 연동
- GitHub 저장소 생성 및 연결

### 목표

- 프로젝트 구조 설계
- 도메인 정의

---

## Day 2 - 도메인 엔티티 설계

### 완료

- Member 엔티티 초안 작성
- Department 엔티티 초안 작성
- Asset 엔티티 초안 작성
- Category 엔티티 초안 작성
- AssetItem 엔티티 초안 작성

### 설계 고민

#### Asset과 AssetItem 분리

초기에는 Asset 엔티티에 수량(count)을 저장하는 방식을 고려했습니다.

하지만 실제 자산은 동일 모델이라도 개별 관리가 필요하다고 판단하여 Asset과 AssetItem을 분리하였다.

예시

- Asset : MacBook Pro 14인치
- AssetItem : MBP-001
- AssetItem : MBP-002

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

### 당시 기준 부족한 점 / 추후 학습

- `@RequestBody`, `@ResponseBody`, `@RestController`의 차이를 더 익숙하게 만들 필요가 있다.
- DTO와 Entity를 언제, 왜 분리하는지 반복 학습이 필요하다.
- `id`와 `loginId`처럼 DB 식별자와 사용자 입력 식별자를 명확히 구분해야 한다.
- `Optional`, `findById`, `findByLoginId`의 반환 타입 차이를 더 연습해야 한다.
- 예외 처리 흐름은 이해했지만, `@ExceptionHandler`, `@RestControllerAdvice`, HTTP 상태코드 매핑은 복습이 필요하다.
- 현재 예외 처리는 단순 구조이므로 추후 `ErrorCode`, `CustomException`, 공통 응답 포맷으로 확장할 필요가 있다.
- 비밀번호 암호화와 Spring Security/JWT 로그인은 아직 적용하지 않았고, 추후 별도 구현이 필요하다.

---

## Day 4 - Category / Asset 등록 기능 구현

### 완료

- Category 등록 API 구현
  - `POST /api/categories`
  - `CategoryCreateRequest`로 요청 데이터 수신
  - `CategoryCreateResponse`로 응답 반환
- Category 중복 이름 검증 구현
  - `findByName`을 사용해 동일 카테고리명 등록 방지
- Category 삭제 API 초안 구현
  - `DELETE /api/categories/{categoryId}`
  - 존재하지 않는 카테고리 삭제 요청 시 예외 처리
  - Asset이 연결된 Category는 삭제하지 못하도록 검증 시도
- Asset 등록 API 구현
  - `POST /api/assets`
  - `AssetCreateRequest`로 요청 데이터 수신
  - `categoryId`로 Category 조회 후 Asset과 연결
  - `AssetCreateResponse`로 응답 반환
- Asset과 Category 연관관계 연결 흐름 구현
  - DTO에서는 `categoryId`를 받고
  - Service에서 Category 엔티티를 조회한 뒤
  - Asset 엔티티에 연결하는 구조로 구현
- AssetItem 등록 기능 설계 시작
  - AssetItem은 Asset이 먼저 존재해야 등록 가능하다는 흐름 정리
  - Request DTO에는 `assetId`, `serialNumber`, `location`이 필요하다고 판단

### 오늘 배운 것

- `ManyToOne`으로 연결된 엔티티는 Request DTO에서 객체가 아니라 id로 받는다.
- DTO의 `categoryId`, `assetId`는 클라이언트가 이전 API 응답에서 받은 id를 다음 요청에 넘기는 값이다.
- Entity는 객체 관계를 가진다. 예: `Asset.category`, `AssetItem.asset`
- DTO는 요청/응답에 필요한 값만 가진다. 예: `categoryId`, `assetId`
- `ResponseEntity.noContent().build()`는 삭제 성공 시 204 No Content 응답을 만들 때 사용한다.
- `findById(...).orElseThrow(...)`는 데이터가 없을 경우 예외를 발생시키고, 있으면 엔티티를 꺼내는 방식이다.
- LAZY 연관관계 컬렉션에 접근할 때 트랜잭션 범위가 중요하다.
- `LazyInitializationException`은 트랜잭션/영속성 컨텍스트 밖에서 지연 로딩 객체에 접근할 때 발생할 수 있다.

### 당시 기준 부족한 점 / 추후 학습

- `ManyToOne` 관계에서 DTO에 왜 Entity가 아니라 id를 받는지 더 반복해서 익숙해질 필요가 있다.
- `categoryId`, `assetId`처럼 이전 API 응답의 id를 다음 요청에서 사용하는 흐름이 아직 낯설다.
- `@Transactional`, 영속성 컨텍스트, LAZY 로딩의 관계를 더 복습해야 한다.
- `LazyInitializationException` 발생 원인과 해결 방법을 별도로 정리할 필요가 있다.
- Controller는 Service만 의존하고, Repository를 직접 의존하지 않는 계층 구조를 더 익숙하게 만들어야 한다.
- REST API 경로 설계에서 `POST`, `DELETE`, 복수형 리소스 경로 사용을 더 연습해야 한다.
- `ResponseEntity<Void>`, `noContent()` 같은 HTTP 응답 제어 방식이 아직 익숙하지 않다.
- AssetItem 등록 흐름에서 `assetId`가 왜 필요한지 처음에 헷갈렸으므로, Entity 관계와 DTO 설계를 다시 복습해야 한다.

---

## Day 6 - AssetItem 등록 및 Loan 대여/반납 기능 구현

### 완료

- AssetItem 등록 API 구현
  - `POST /api/asset-items`
  - `AssetItemCreateRequest`로 `serialNumber`, `location`, `assetId` 수신
  - `assetId`로 Asset 조회 후 AssetItem 연결
  - 신규 AssetItem 상태를 `AVAILABLE`로 기본 설정
- AssetItem 상태 변경 메서드 구현
  - `rentAsset()` → `RENTED`
  - `returnAsset()` → `AVAILABLE`
- Loan 생성 API 구현
  - `POST /api/loans`
  - `memberId`, `assetItemId`로 Member와 AssetItem 조회
  - AssetItem이 `AVAILABLE`일 때만 대여 가능
  - 대여 성공 시 AssetItem 상태를 `RENTED`로 변경
  - Loan 상태를 `RENTED`로 저장
  - 대여일과 반납 예정일 자동 설정
- Loan 반납 API 구현
  - `POST /api/loans/{loanId}/return`
  - loanId로 Loan 조회
  - Loan 상태가 `RENTED`일 때만 반납 처리
  - Loan 상태를 `RETURNED`로 변경
  - AssetItem 상태를 `AVAILABLE`로 변경
  - 실제 반납일 저장
- Postman으로 전체 흐름 테스트
  - 회원 생성
  - 카테고리 생성
  - 자산 생성
  - 자산 품목 생성
  - 대여 생성
  - 동일 품목 중복 대여 방지 확인
  - 반납 처리 확인

### 오늘 배운 것

- `ManyToOne` 관계에서 DTO는 Entity 객체가 아니라 id를 받는다.
- `AssetItemCreateRequest`에는 `assetId`가 필요하다.
- `LoanCreateRequest`에는 `memberId`, `assetItemId`가 필요하다.
- 서버가 생성한 id를 클라이언트가 다음 요청에서 다시 넘기는 흐름을 이해했다.
- `@RequestBody`가 없으면 JSON body가 DTO에 바인딩되지 않아 필드가 null이 될 수 있다.
- 대여 생성은 단순 저장이 아니라 AssetItem 상태 변경까지 함께 처리해야 한다.
- 반납은 Loan 상태와 AssetItem 상태를 함께 변경해야 한다.
- `POST`는 생성/상태 변경에 사용하고, `GET`은 조회에 사용한다.
- URL PathVariable 방식과 RequestBody DTO 방식의 차이를 이해했다.

## Day 7 - 대여 조회 및 예약 기능 구현

### 완료

- Loan 조회 API 구현
  - 전체 대여 이력 조회
  - 회원별 대여 이력 조회
  - Loan 엔티티를 직접 반환하지 않고 `LoanListResponse` DTO로 변환
- Reservation 엔티티 설계 및 구현
  - Member와 Reservation 연관관계 설정
  - AssetItem과 Reservation 연관관계 설정
  - 예약 상태 `WAITING` 기본 설정
  - 예약일 `reservedAt` 자동 저장
- Reservation 생성 API 구현
  - `POST /api/reservations`
  - `memberId`, `assetItemId`로 Member와 AssetItem 조회
  - AssetItem이 `RENTED` 상태일 때만 예약 가능
  - 예약 성공 시 Reservation 저장 및 응답 반환
- Reservation 조회 API 구현
  - 전체 예약 조회
  - 회원별 예약 조회
  - Reservation 엔티티를 직접 반환하지 않고 DTO로 변환
- Postman 테스트 및 오류 수정
  - `mappedBy`에 DB 컬럼명이 아니라 상대 엔티티 필드명을 써야 한다는 점 확인
  - `/api/reservation`과 `/api/reservations` 경로 불일치 수정
  - `@RequestBody` 누락 시 JSON 값이 DTO에 바인딩되지 않는 문제 재확인

### 오늘 배운 것

- `mappedBy`에는 DB 컬럼명이 아니라 상대 엔티티의 필드명을 적는다.
  - 예: `mappedBy = "member"`, `mappedBy = "assetItem"`
- `@JoinColumn(name = "...")`은 실제 DB FK 컬럼명을 지정한다.
- Entity는 객체 관계를 가진다.
  - `Reservation.member`
  - `Reservation.assetItem`
- DTO는 요청에 필요한 id를 가진다.
  - `memberId`
  - `assetItemId`
- 예약 생성은 아직 예약 id가 없으므로 `reservationId`를 Request로 받지 않는다.
- 예약 생성은 `new Reservation(member, assetItem)` 후 `save()` 하는 흐름이다.
- 예약은 Loan과 역할이 다르다.
  - Loan은 실제 대여 기록
  - Reservation은 대여 중인 자산에 대한 대기 기록
- `findByMemberId()` 같은 Spring Data JPA 쿼리 메서드는 메서드 이름으로 where 조건을 만든다.
- 회원 1명은 여러 예약을 가질 수 있으므로 `Optional<Reservation>`이 아니라 `List<Reservation>`으로 조회해야 한다.
- 조회 결과가 없는 경우에는 예외보다 빈 리스트 `[]` 반환이 자연스러울 수 있다.

### 당시 기준 부족한 점 / 추후 학습

- `mappedBy`와 `@JoinColumn`의 차이를 반복해서 복습할 필요가 있다.
- 생성 API와 조회 API 흐름을 헷갈리는 경우가 있다.
  - 생성: `new + save`
  - 조회: `findById`, `findAll`, `findBy...`
- Request DTO에 어떤 id가 들어가야 하는지 아직 설계 초반에 헷갈린다.
- Controller 메서드명, Service 메서드명 컨벤션을 더 정리해야 한다.
- 전체 조회와 회원별 조회의 URL 설계를 더 일관되게 다듬을 필요가 있다.
- 현재 Reservation은 예약 생성/조회까지만 구현되어 있고, 예약 취소와 예약 완료 처리는 아직 남아 있다.
- Loan/Reservation 조회 시 Lazy 로딩과 N+1 문제가 발생할 수 있으므로 추후 fetch join 또는 DTO 조회 방식으로 개선해야 한다.

## Day 8 - 예약 우선권 및 연체 처리 구현

### 완료

- 반납 시 예약 대기자가 있는 경우 첫 번째 예약자를 READY 상태로 변경
- 예약자가 있는 자산 품목은 READY 예약자만 대여 가능하도록 검증
- 예약자가 실제 대여하면 ReservationStatus를 COMPLETED로 변경
- 예약 순서 보장을 위해 reservedAt 오름차순 조회 적용
- Loan 연체 처리 로직 구현
  - RENTED 상태이고 dueDate가 지난 대여를 OVERDUE로 변경
- Spring Scheduler 설정
  - 매일 정해진 시간에 연체 상태 갱신 가능하도록 구성

### 오늘 배운 것

- LoanStatus는 대여 기록 상태, AssetItemStatus는 물건 상태, ReservationStatus는 예약 상태를 의미한다.
- ReservationStatus.COMPLETED는 대여 완료가 아니라 예약이 실제 대여로 이어져 종료된 상태다.
- 예약 우선권은 AssetItemStatus가 아니라 ReservationStatus.READY로 관리할 수 있다.
- Spring Data JPA 메서드 이름에 OrderByReservedAtAsc를 붙이면 예약 순서를 보장할 수 있다.
- setter 대신 markOverdue(), completed(), ready() 같은 도메인 메서드로 상태를 변경하는 것이 더 자연스럽다.

### 당시 기준 부족한 점 / 추후 개선

- 예약 우선권 로직은 구현했지만, `get(0)`에 의존하므로 조회 정렬 조건이 반드시 유지되어야 한다.
- READY 상태 예약자가 일정 시간 안에 대여하지 않을 경우 만료 처리하는 정책이 아직 없다.
- 연체 처리는 Scheduler로 구현했지만, 실제 동작 테스트와 로그 확인이 필요하다.
- `@Scheduled` cron 표현식과 실행 주기를 README에 명확히 기록할 필요가 있다.
- 예약/대여/반납/연체 흐름에 대한 Service 테스트가 아직 부족하다.
- 현재 예외 처리는 `IllegalStateException` 중심이라 추후 `ErrorCode`, `CustomException` 구조로 개선할 필요가 있다.
- 동시 대여 요청 상황에서 중복 대여가 발생할 수 있으므로 이후 동시성 제어가 필요하다.

## Day 9 - Bean Validation 적용 시작

### 완료

- 주요 생성 요청 DTO에 Bean Validation 적용 시작
  - MemberCreateRequest
  - AssetCreateRequest
  - AssetItemCreateRequest
  - CategoryCreateRequest
  - LoanCreateRequest
  - ReservationCreateRequest
- Controller의 RequestBody 파라미터에 @Valid 적용 시작
- 문자열 필드에는 @NotBlank, id/enum 필드에는 @NotNull을 적용하는 기준 정리
- AssetType 같은 enum 필드는 @NotNull로 누락 여부를 검증할 수 있음을 확인
- DELETE PathVariable에는 @Valid를 붙이지 않는 방향으로 정리

### 오늘 배운 것

- @Valid는 주로 Controller에서 Request DTO 검증을 실행할 때 사용한다.
- 검증 조건은 Entity보다 Request DTO에 우선 적용하는 것이 현재 구조에 적합하다.
- Repository에는 Bean Validation을 적용하지 않는다.
- String 값은 @NotNull보다 @NotBlank가 더 적합하다.
- Long id, Enum 값은 @NotNull을 사용한다.
- 잘못된 enum 문자열은 @NotNull 검증이 아니라 JSON 역직렬화 단계에서 예외가 발생할 수 있다.

### 당시 기준 부족한 점 / 추후 개선

- 모든 Controller에 @Valid가 빠짐없이 적용됐는지 재확인 필요
- Request DTO별 검증 어노테이션이 적절한지 재검토 필요
- Validation 실패 시 기본 에러 응답이 반환되므로 MethodArgumentNotValidException 예외 처리가 필요
- enum 변환 실패(HttpMessageNotReadableException) 예외 처리도 추후 필요
- Postman으로 검증 실패 케이스 테스트 필요
- LoanListRequest처럼 실제 사용 여부가 불명확한 DTO는 정리 필요

## Day 10 - Bean Validation 및 예약 예외 정책 보완

### 완료

- 주요 Request DTO에 Bean Validation 적용
  - MemberCreateRequest
  - AssetCreateRequest
  - AssetItemCreateRequest
  - CategoryCreateRequest
  - LoanCreateRequest
  - ReservationCreateRequest
- Controller의 생성 요청 API에 `@Valid @RequestBody` 적용
- GlobalExceptionHandler 통합
  - IllegalStateException 처리
  - MethodArgumentNotValidException 처리
- Validation 실패 시 `VALIDATION_ERROR` 응답 반환 확인
- 본인이 대여 중인 자산은 예약할 수 없도록 검증 추가
- 동일 회원이 같은 자산품목에 WAITING/READY 예약을 중복 생성하지 못하도록 검증 추가
- Postman으로 예약 예외 시나리오 검증
  - 본인 대여 중 예약 실패
  - 중복 예약 실패
  - 예약 우선권 정상 동작 확인

### 배운 점

- `@Valid`는 Controller 진입 전에 Request DTO를 검증한다.
- String 필드는 `@NotBlank`, Long/Enum 필드는 `@NotNull`을 사용한다.
- Validation 실패는 `MethodArgumentNotValidException`으로 처리할 수 있다.
- `existsBy...`는 조건에 맞는 데이터 존재 여부를 boolean으로 확인할 때 사용한다.
- WAITING/READY 예약은 아직 살아있는 예약이므로 중복 예약 방지 대상이다.

### 당시 기준 부족한 점 / 추후 개선

- Validation 메시지가 아직 DTO에 직접 작성되어 있어 추후 messages.properties 분리 가능
- ErrorCode enum / CustomException 구조는 아직 미적용
- Service 테스트 코드가 아직 부족함
- 예약/대여/반납/연체 시나리오를 테스트 코드로 고정해야 함
- Querydsl 관리자 검색 기능 미구현
- JWT 인증/권한 처리 미구현
- README에 오늘 구현한 비즈니스 정책 정리 필요

## Day 11 - Service 테스트 코드 작성

### 완료

- LoanServiceTest 작성
  - 대여 생성 테스트
  - 반납 테스트
  - 전체 대여 조회 테스트
  - 회원별 대여 조회 테스트
- ReservationServiceTest 작성
  - 예약 생성 성공 테스트
  - 본인이 대여 중인 자산 예약 실패 테스트
  - 중복 예약 실패 테스트
  - 대여 중이 아닌 자산 예약 실패 테스트
  - 전체 예약 조회 테스트
  - 회원별 예약 조회 테스트
  - 예약 취소 테스트
  - 존재하지 않는 예약 취소 실패 테스트
- 테스트 데이터 준비 메서드 작성
- Given / When / Then 흐름 학습
- AssertJ 기본 검증 학습
- `assertThatThrownBy()`를 사용한 예외 테스트 학습
- Request DTO 테스트 생성을 위해 `@AllArgsConstructor` 적용

### 당시 기준 부족한 점 / 추후 개선

- 테스트 데이터 생성 코드가 중복되어 추후 TestFixture로 분리 필요
- 테스트 메서드명이 아직 더 명확해질 필요 있음
- 연체 Scheduler 테스트는 아직 미작성
- Controller 테스트는 아직 미작성
- Querydsl, JWT, 배포 작업이 남아 있음

## Day 12 - Querydsl 회원 검색 기능 적용

### 완료

- Querydsl 의존성 및 설정 추가
- Q타입 생성 확인
- `JPAQueryFactory` Bean 등록
- Member 검색 조건 DTO 작성
  - loginId
  - name
  - status
  - departmentName
- Member 검색 응답 DTO 작성
- `MemberRepositoryCustom`, `MemberRepositoryImpl` 구조 적용
- Querydsl을 사용한 회원 검색 구현
  - loginId 조건 검색
  - name 조건 검색
  - status 조건 검색
  - departmentName 조건 검색
- 회원 검색 API에 페이징 적용
- Postman으로 검색 및 페이징 결과 확인

### 오늘 배운 것

- Q타입은 엔티티가 아니라 Querydsl에서 쿼리를 작성하기 위한 메타 모델이다.
- `JPAQueryFactory`는 Querydsl 쿼리를 만들고 실행하기 위한 핵심 객체다.
- `@Configuration`과 `@Bean`을 사용해 `JPAQueryFactory`를 스프링 빈으로 등록할 수 있다.
- `MemberSearchCondition`은 검색 입력값을 담는 DTO이고, `MemberSearchResponse`는 검색 결과를 반환하는 DTO다.
- `leftJoin(member.department, department)`는 Member와 Department를 연결해서 부서명을 조회하기 위해 사용한다.
- `where()`에서 null 조건은 무시되므로 동적 검색 조건을 만들 수 있다.
- `hasText()`는 문자열 조건이 있을 때만 검색 조건을 추가하기 위해 사용한다.
- enum 조건은 `hasText()`가 아니라 `status != null`로 검사해야 한다.

### 당시 기준 부족한 점 / 추후 개선

- 현재 Querydsl 검색은 Member에만 적용되어 있다.
- Asset, Loan, Reservation 검색 API에도 Querydsl 적용 필요
- 검색 메서드 이름을 `searchComplex`에서 더 명확한 이름으로 리팩토링 필요
- Department 테스트 데이터 추가 후 departmentName 검색 검증 필요
- Querydsl Repository 테스트 코드 작성 필요

## Day 13 - Querydsl 검색 기능 확장

### 완료

- Asset 검색 API에 Querydsl 적용
  - 자산명 검색
  - 자산 유형 검색
  - 카테고리명 검색
  - 페이징 적용
- Loan 검색 API에 Querydsl 적용
  - 회원명 검색
  - 자산품목 id 검색
  - 대여 상태 검색
  - 대여일 기간 검색
  - 페이징 및 정렬 적용
- Reservation 검색 API에 Querydsl 적용 시작
  - 회원명 검색
  - 자산명 검색
  - 예약 상태 검색
  - 예약일 기간 검색
- 검색 응답 DTO 정리
  - Entity를 직접 반환하지 않고 필요한 값만 DTO로 반환
- InitTestData에 테스트용 Category, Asset, AssetItem, Loan, Reservation 데이터 추가
- Postman으로 Asset/Loan 검색 및 페이징 동작 확인

### 오늘 배운 것

- 검색 조건 DTO와 응답 DTO의 역할이 다르다.
- Condition은 사용자가 입력한 검색 조건이고, Response는 화면에 보여줄 결과다.
- Entity는 응답 DTO에 직접 넣지 않고 필요한 값만 꺼내는 것이 안전하다.
- Enum은 단순 값이므로 응답 DTO에 포함해도 괜찮다.
- 연관된 엔티티 값을 조회하려면 join이 필요하다.
- `Loan -> AssetItem -> Asset`처럼 여러 단계의 연관관계도 Querydsl join으로 조회할 수 있다.
- countQuery는 DTO 조회가 아니라 전체 개수 조회이므로 `select(count())`를 사용한다.
- 기간 검색은 From에는 `goe`, To에는 `loe`를 사용한다.
- countQuery에는 정렬을 넣지 않는다.

### 당시 기준 부족한 점 / 추후 개선

- Reservation 검색 API 최종 Postman 테스트 필요
- 검색 메서드 이름을 `searchComplex`에서 도메인별 명확한 이름으로 리팩토링 필요
- 검색 조건 일부는 정확 검색(`eq`) 기준이라 추후 부분 검색(`containsIgnoreCase`) 적용 검토
- Querydsl Repository 테스트 코드 작성 필요
- Swagger 문서화 필요
- JWT 인증/권한 처리 미구현

## Day 14 - React 프론트엔드 연동 및 프로젝트 구조 통합

### 완료

- React/Vite 프론트엔드 프로젝트 구성
- React Router를 사용한 페이지 라우팅 적용
- 회원 목록 조회 API 연동
- 회원가입 폼 및 회원가입 API 연동
- 회원 검색 조건 입력 UI 구현
- `URLSearchParams`를 사용한 검색 쿼리스트링 생성
- 백엔드와 프론트엔드를 하나의 Git 저장소로 통합
  - `backend/`
  - `frontend/`

### 오늘 배운 것

- React의 `Route`는 URL과 화면 컴포넌트를 연결한다.
- `Link`는 사용자의 화면 이동에 사용하고, `useNavigate`는 로직 처리 후 이동할 때 사용한다.
- controlled component는 input 값과 React state를 연결하는 방식이다.
- `URLSearchParams`는 검색 조건을 URL 쿼리스트링으로 변환한다.
- Spring의 `Page` 응답에서 실제 조회 결과는 `content`에 들어 있다.
- Git 저장소의 `.git` 폴더를 상위 루트로 옮기면 기존 커밋 이력을 유지하면서 모노레포 구조로 변경할 수 있다.

### 당시 기준 부족한 점 / 추후 개선

- 회원 검색 시 빈 조건을 쿼리스트링에서 제외하도록 개선 필요
- 검색 버튼 및 실제 검색 API 호출 흐름 최종 점검 필요
- Enter 키 검색을 위한 form 적용 검토
- 로딩 및 오류 메시지 처리 필요
- 자산, 자산품목, 대여, 예약 화면 구현 필요
- 프로젝트 루트 README를 백엔드/프론트 통합 구조에 맞게 수정 필요

## Day 15 (1) - AssetItem 관리 및 React API 연동

### 완료

- AssetItem 조회 API 구현
  - `GET /api/asset-items`
  - AssetItem 목록 조회
  - Response DTO 반환
    - assetItemId
    - assetName
    - serialNumber
    - location
    - assetItemStatus
    - assetId
- AssetItem 폐기 기능 구현
  - 물리 삭제 대신 `DISPOSED` 상태로 변경
  - `dispose()` 도메인 메서드 추가
  - 대여 중(`RENTED`)인 자산 품목은 폐기 불가
- Reservation 상태 변경 정책 보완
  - `WAITING → READY`
  - `READY → COMPLETED`
  - `WAITING / READY → CANCELED`
  - 완료된 예약은 취소 불가
  - 이미 취소된 예약은 중복 취소 불가
- React `AssetItemPage` 구현
  - `useState`로 자산 품목 목록 관리
  - `useEffect`로 최초 렌더링 시 조회
  - `fetch("/api/asset-items")`로 백엔드 API 연동
  - 자산명, 위치, 시리얼번호, 상태 출력
- Vite Proxy 적용
  - `/api` 요청을 Spring Boot(8080)로 전달
  - 개발 환경 CORS 문제 해결

### 배운 점

- React Hook(`useState`, `useEffect`)은 컴포넌트 내부에서 호출한다.
- `fetch()`는 Promise를 반환한다.
- `async/await`는 Promise 기반 코드를 순차적으로 읽기 쉽게 작성하는 문법이다.
- `response.json()`도 Promise를 반환하므로 `await`가 필요하다.
- `try-catch`로 네트워크 예외를 처리할 수 있다.
- `useEffect(..., [])`는 컴포넌트 최초 렌더링 시 한 번 실행된다.
- `map()`으로 배열 데이터를 반복 렌더링할 수 있다.
- Vite Proxy를 사용할 경우 프론트에서는 `fetch("/api/...")` 형태로 요청할 수 있다.

### 당시 기준 남은 과제

- AssetItem 등록 화면 구현
- AssetItem 폐기 버튼 및 API 연동
- AssetItem 목록 Table UI 개선
- 로딩 상태 관리
- 공통 API 호출 함수 분리 검토
- axios 도입 여부 검토
- AssetItem 검색 기능 추가

---

## Day 15 (2) - 예약 생성 화면 및 프론트 연동

### Frontend

- 예약 생성 페이지 구현
- 예약 생성 라우팅 및 목록 페이지 이동 처리
- 자산 품목 조회 API 함수 분리
- 예약 페이지에서 자산 품목 목록 불러오기
- select를 통한 예약 대상 자산 품목 선택 기능 구현
- 예약 요청 상태(memberId, assetItemId) 관리
- POST /api/reservations API 연동
- 자산 미선택 시 제출 검증 추가
- 예약 실패 예외 처리 추가

### 학습 / 트러블슈팅

- useEffect는 페이지 진입 시 조회 요청에 사용
- handleSubmit은 사용자 제출 시 등록 요청에 사용
- API 함수에서는 React state를 직접 변경하지 않고 데이터만 반환
- select의 name과 e.target.name을 이용한 객체 state 변경 이해
- 이벤트 핸들러는 선언만 하는 것이 아니라 전달하거나 직접 호출해야 함
- Response 객체와 React state 객체의 역할 차이 확인

## 2026-08-01

### Loan

- 대여 생성 화면 구현
- 대여 가능한 자산 품목 조회 API 연동
- 자산 선택 후 대여 생성 기능 구현
- 대여 전체 조회 화면 구현
- 반납 요청 상태(RETURN_REQUESTED) 표시
- 관리자 반납 승인 기능 구현
- 대여 상태 변경 시 화면 즉시 갱신

### Backend

- LoanStatus에 RETURN_REQUESTED 추가
- 회원 반납 요청 API 추가
- 관리자 반납 승인 API 추가
- Loan 엔티티 상태 변경 로직 개선
  - requestReturn()
  - approveReturn()
  - markOverdue()
- Loan DTO에 회원명, 자산명, 시리얼번호 추가

### Frontend

- 관리자(admin) 페이지 구조 분리 시작
- 관리자/회원 URL 구조 정리
- LoanCreatePage 구현
- LoanPage 관리자 화면 개선

## 2026-08-03 ~ 2026-08-04

### Frontend 구조 리팩터링

- 프론트엔드 디렉터리를 역할 중심 구조에서 도메인 중심 구조로 변경
  - `features/asset`
  - `features/category`
  - `features/member`
  - `features/loan`
  - `features/reservation`
  - `features/home`
- 관리자 페이지 파일명을 역할이 드러나도록 정리
  - `AssetAdminPage`
  - `AssetItemAdminPage`
  - `CategoryAdminPage`
  - `MemberAdminPage`
  - `LoanAdminPage`
  - `ReservationAdminPage`
- 기존 `features/admin/pages`에 모여 있던 페이지를 각 도메인 폴더로 이동
- 파일 이동에 맞춰 `App.jsx`의 import 경로와 Route 재정리
- 관리자와 사용자 URL 역할 분리
  - 관리자 자산 목록: `/admin/assets`
  - 관리자 자산 상세: `/admin/assets/:assetId`
  - 관리자 대여 관리: `/admin/loans`
  - 관리자 예약 현황: `/admin/reservations`
  - 사용자 대여 신청: `/loans/new`
  - 사용자 대여 목록: `/loans`
  - 사용자 예약 신청: `/reservations/new`

### Asset

- 관리자 자산 목록 화면 개선
  - 자산명 및 카테고리 검색
  - 페이지네이션 적용
  - 전체 품목 수 표시
  - 대여 가능 품목 수 표시
  - 자산명 클릭 시 상세 페이지 이동
- Asset 검색 Querydsl 집계 쿼리 개선
  - `Asset`과 `AssetItem` left join
  - `groupBy`를 사용해 자산별 품목 수 집계
  - `assetItem.id.count()`로 전체 품목 수 계산
  - `CaseBuilder`를 사용해 `AVAILABLE` 품목 수 계산
- 자산 상세 조회 API 구현
  - `GET /api/assets/{assetId}`
  - 자산명, 설명, 카테고리, 전체 품목 수, 대여 가능 수 반환
  - 연결된 개별 AssetItem 목록 반환
- `AssetDetailPage` 구현
  - `useParams()`로 URL의 `assetId` 조회
  - 자산 기본 정보 출력
  - 개별 품목의 시리얼번호, 위치, 상태 출력
  - 등록된 품목이 없을 경우 빈 목록 메시지 표시
  - 자산 목록으로 이동하는 링크 추가
  - 임시 이미지 영역 추가
- 자산 등록 완료 후 잘못된 경로로 이동하던 문제 수정
  - `/assets` → `/admin/assets`

### Member / Asset 검색 개선

- Querydsl 문자열 검색 방식을 완전 일치에서 부분 일치로 변경
  - `eq()` → `contains()` 또는 `containsIgnoreCase()`
- 회원 검색 개선
  - loginId 부분 검색
  - 회원명 부분 검색
  - 부서명 부분 검색
- 자산 검색 개선
  - 자산명 부분 검색
  - 카테고리명 부분 검색
- 검색 메서드 이름을 실제 동작에 맞게 변경
  - `nameEq()` → `nameContains()`
  - `memberNameEq()` → `memberNameContains()`

### Loan

- 관리자 대여 페이지를 카드형 목록에서 테이블 구조로 변경
- 관리자 대여 검색 API 연동
  - `GET /api/loans/search`
  - 회원명 검색
  - 자산품목 번호 검색
  - 대여 상태 검색
  - 대여일 기간 검색
  - 페이지네이션 적용
- 관리자 반납 승인 기능 유지
  - `RETURN_REQUESTED` 상태일 때 반납 승인 가능
  - 승인 성공 시 해당 대여 건의 상태와 실제 반납일을 화면에서 즉시 갱신
- 관리자 페이지와 사용자 페이지의 역할 구분
  - 관리자: 전체 대여 현황 조회 및 반납 승인
  - 사용자: 본인 대여 목록 조회 및 반납 요청

### Reservation

- 관리자 예약 현황 페이지를 테이블 구조로 변경
- 관리자용 예약 생성 및 일반 예약 취소 기능 제거
  - 관리자는 전체 예약 현황 조회 중심
  - 사용자는 본인의 예약 생성 및 취소 담당
- 예약 검색 API 연동
  - `GET /api/reservations/search`
  - 회원명 검색
  - 자산명 검색
  - 예약 상태 검색
  - 페이지네이션 적용
- 예약 Querydsl 문자열 검색을 부분 검색으로 변경
  - 회원명 `contains()`
  - 자산명 `containsIgnoreCase()`
- 예약 상태와 예약일 기간 조건은 정확 검색 및 범위 검색 유지
  - 상태: `eq()`
  - 시작일: `goe()`
  - 종료일: `loe()`

### 오늘 배운 것

- 프론트 화면 URL과 백엔드 API URL은 역할이 다르다.
  - `/admin/assets`는 React 화면 경로
  - `/api/assets/search`는 백엔드 데이터 요청 경로
- `useParams()`는 배열이 아니라 객체를 반환한다.
  - `const { assetId } = useParams()`
- API 응답 전에는 state가 `null`일 수 있으므로 로딩 처리가 필요하다.
  - `if (!asset) return <p>불러오는 중...</p>`
- 객체 내부에 List가 포함될 수 있다.
  - `asset`은 객체 하나
  - `asset.assetItems`는 배열
- 자산의 전체 품목 수는 별도 수량 필드를 직접 입력하는 것이 아니라 연결된 AssetItem 개수로 계산한다.
- 대여 가능 수는 `AVAILABLE` 상태인 AssetItem 개수로 계산한다.
- `CaseBuilder`를 사용하면 SQL의 CASE WHEN과 같은 조건부 집계를 Querydsl에서 작성할 수 있다.
- 관리자 화면과 사용자 화면은 같은 도메인을 사용하더라도 목적이 다르다.
  - 관리자는 전체 현황 및 상태 처리
  - 사용자는 본인의 신청과 조회
- Querydsl의 `BooleanExpression`은 조회 결과가 아니라 `where`절에 들어갈 검색 조건 객체다.
- `where()`에 전달된 null 조건은 Querydsl이 무시하므로 동적 검색을 구현할 수 있다.
- 문자열 검색은 사용자 경험을 고려해 이름이나 자산명에는 부분 검색을 사용하는 것이 자연스럽다.
- Enum, id, 상태값처럼 명확한 값은 `eq()` 검색을 유지하는 것이 적절하다.

### 트러블슈팅

#### 자산 상세 페이지에서 null 참조 오류

첫 렌더링 시 API 응답이 도착하기 전에 `asset.assetItems`에 접근하여 오류가 발생했다.

```text
Cannot read properties of null (reading 'assetItems')
```

## 2026-08-05 ~ 2026-08-06 - 예약 대기열 우선순위 및 취소 로직 보완

### 구현 내용

- 예약 시각을 `LocalDate`에서 `LocalDateTime`으로 변경
- 예약 우선순위 조회를 전체 목록 조회 방식에서 단건 조회 방식으로 개선
  - `findFirstByAssetItemIdAndReservationStatusOrderByReservedAtAscIdAsc`
- 동일 예약 시각에서는 예약 ID 오름차순으로 우선순위 보완
- 관리자 반납 승인 시 가장 빠른 `WAITING` 예약을 `READY`로 승격
- `READY` 예약자가 대여하면 예약 상태를 `COMPLETED`로 변경
- `READY` 예약 취소 시 다음 `WAITING` 예약을 자동으로 `READY`로 승격
- `WAITING` 예약 취소 시 다른 대기 예약의 상태를 유지
- 자기 자산 예약 차단 범위를 활성 대여 상태 전체로 확장
  - `RENTED`
  - `OVERDUE`
  - `RETURN_REQUESTED`

### 테스트

- `READY` 예약 취소 시 다음 `WAITING` 예약이 `READY`로 변경되는지 검증
- `WAITING` 예약 취소 시 다른 `WAITING` 예약들이 유지되는지 검증

### 개선 전

- 조건에 맞는 예약 전체를 `List`로 조회한 뒤 `get(0)`으로 첫 예약 선택
- 예약 날짜가 `LocalDate`라 같은 날 예약의 정확한 우선순위가 불명확
- `READY` 예약 취소 후 다음 대기자가 승격되지 않음
- 자기 예약 차단 시 `RENTED` 상태만 검사

### 개선 후

- DB에서 우선순위가 가장 높은 예약 한 건만 `Optional`로 조회
- 예약 시각과 ID를 기준으로 대기 순서를 결정
- 우선 예약자가 취소해도 다음 대기자의 우선권 유지
- 연체 및 반납 요청 상태도 활성 대여로 판단해 자기 예약 차단

---

## 2026-08-07 ~ 2026-08-16 - Spring Security 세션 인증 / 인가 / CSRF / 프론트 인증 상태 연동

### 구현 배경

기존 AssetFlow는 회원 ID를 프론트에서 직접 넘겨받아 대여·예약 기능을 처리하는 구조였다.
이 방식은 화면 동작 자체는 단순하지만, 클라이언트가 `memberId`를 조작할 수 있기 때문에 로그인 기능을 붙인 이후에는 보안상 문제가 될 수 있다.

이번 작업에서는 JWT 대신 **Spring Security의 세션 기반 인증**을 적용하고,
로그인 사용자 정보는 서버의 `SecurityContext`와 `HttpSession`을 기준으로 판단하도록 구조를 변경하였다.

### 인증 방식 선택

- JWT 대신 세션 기반 인증 사용
- 이유
  - 사내 자산 관리 시스템 성격상 브라우저 기반 단일 웹 애플리케이션에 가깝다.
  - 프론트와 백엔드가 같은 서비스에서 동작하는 구조에서는 세션 인증으로도 충분하다.
  - 포트폴리오에서 인증 원리를 직접 이해하고 구현하는 데 집중하기 위해 OAuth2/JWT까지 범위를 확장하지 않았다.

### Backend 인증 구성

- Spring Security 설정 추가
- `PasswordEncoder`로 BCrypt 사용
- 회원가입 시 비밀번호를 평문으로 저장하지 않고 BCrypt로 암호화
- 로그인 시 `AuthenticationManager`를 통해 인증 수행
- `DaoAuthenticationProvider`가 `CustomUserDetailsService`와 `PasswordEncoder`를 사용해 실제 인증 처리
- `CustomUserDetailsService`에서 `loginId`로 Member 조회
- `CustomUserDetails`가 Member 정보를 Spring Security가 이해할 수 있는 `UserDetails` 형태로 감싸도록 구성

### 인증 객체 흐름

로그인 요청 시 전체 흐름은 다음과 같다.

```text
LoginRequest
    ↓
AuthenticationManager
    ↓
DaoAuthenticationProvider
    ↓
CustomUserDetailsService
    ↓
Member 조회
    ↓
CustomUserDetails
    ↓
PasswordEncoder 비밀번호 비교
    ↓
Authentication 생성
```

여기서 `Authentication`은 인증이 완료된 사용자의 정보를 담는 객체다.

주요 정보:

- `authentication.getPrincipal()`
  - 현재 인증된 사용자 객체
  - 이 프로젝트에서는 `CustomUserDetails`
- `authentication.getAuthorities()`
  - 사용자의 권한 정보
- `authentication.isAuthenticated()`
  - 인증 완료 여부

### CustomUserDetails를 만든 이유

Spring Security는 프로젝트의 `Member` 엔티티 구조를 직접 알지 못한다.
따라서 `Member`를 Security가 이해할 수 있는 `UserDetails` 형태로 변환하는 어댑터 역할이 필요하다.

```text
Member
  ↓ 감싸기
CustomUserDetails
  ↓
Spring Security 인증 객체에서 사용
```

로그인 이후에는 반대로 다음 흐름으로 현재 로그인 Member를 꺼낼 수 있다.

```text
Authentication
    ↓ getPrincipal()
CustomUserDetails
    ↓ getMember()
Member
```

예시:

```java
CustomUserDetails userDetails =
        (CustomUserDetails) authentication.getPrincipal();

Member member = userDetails.getMember();
```

이 코드는 "현재 로그인한 사용자의 Member를 꺼낸다"는 의미다.

### SecurityContext와 세션 저장

직접 만든 JSON 로그인 API에서 인증 성공 후 `Authentication`만 생성하고 끝내면 다음 요청에서 로그인 상태가 유지되지 않는다.

따라서 인증 성공 후:

```text
Authentication
    ↓
SecurityContext
    ↓
SecurityContextRepository
    ↓
HttpSession
```

흐름으로 저장하였다.

브라우저는 이후 `JSESSIONID` 쿠키를 자동으로 전송하고,
Spring Security는 해당 세션을 통해 다음 요청에서도 로그인 사용자를 복구한다.

### `/api/auth/me`

새로고침 후 React state는 초기화되지만 서버 세션은 남아 있을 수 있다.
그래서 현재 로그인 사용자 정보를 다시 얻기 위한 `/api/auth/me` API를 구현했다.

```java
@GetMapping("me")
public SessionMember me(Authentication authentication) {
    CustomUserDetails userDetails =
            (CustomUserDetails) authentication.getPrincipal();

    Member member = userDetails.getMember();

    return new SessionMember(
            member.getId(),
            member.getLoginId(),
            member.getName(),
            member.getRole()
    );
}
```

핵심 흐름:

```text
Member.role
  ↓
SessionMember.role
  ↓ JSON 응답
response.json()
  ↓
setUser(data)
  ↓
AuthContext의 user.role
```

### React AuthContext

React의 로그인 상태는 여러 페이지에서 공통으로 사용해야 한다.
그래서 `AuthContext`를 만들어 로그인 사용자와 로딩 상태를 전역적으로 공유하였다.

```jsx
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

- `user`
  - 현재 로그인한 사용자 정보
- `loading`
  - `/api/auth/me` 요청이 아직 끝나지 않았는지 여부

Provider:

```jsx
<AuthContext.Provider value={{ user, setUser, loading }}>
  {children}
</AuthContext.Provider>
```

다른 컴포넌트에서는:

```jsx
const { user, loading } = useContext(AuthContext);
```

로 꺼내 사용한다.

### `children`과 props 이해

```jsx
<ProtectedRoute roles={["ADMIN", "MANAGER"]}>
  <AssetAdminPage />
</ProtectedRoute>
```

위 코드에서 `ProtectedRoute`가 받는 props는 개념적으로 다음과 같다.

```text
children = <AssetAdminPage />
roles = ["ADMIN", "MANAGER"]
```

따라서:

```jsx
const ProtectedRoute = ({ children, roles }) => {
```

는 props 객체에서 `children`, `roles`를 구조 분해 할당하는 코드다.

반면 `user`, `loading`은 props가 아니라 Context에서 가져온다.

```jsx
const { user, loading } = useContext(AuthContext);
```

즉 `ProtectedRoute` 안에서는 두 경로의 데이터를 동시에 사용한다.

```text
App.jsx → children, roles 전달
AuthContext → user, loading 제공
```

### ProtectedRoute

프론트에서 비로그인 또는 권한 없는 사용자가 관리자 페이지를 직접 URL로 접근했을 때 빈 화면이나 403 요청만 발생하는 문제가 있었다.

이를 UX 수준에서 막기 위해 `ProtectedRoute`를 구현하였다.

```jsx
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

역할:

- 로그인 정보 확인 중 → 화면 렌더링 보류
- 비로그인 → `/login` 이동
- 역할 불일치 → `/` 이동
- 역할 일치 → 원래 페이지 렌더링

### App.jsx의 roles 의미

`ProtectedRoute` 자체는 어떤 페이지에 어떤 역할이 허용되는지 알 수 없다.
페이지별 허용 역할은 `App.jsx`에서 props로 전달한다.

```jsx
<ProtectedRoute roles={["ADMIN", "MANAGER"]}>
  <MemberAdminPage />
</ProtectedRoute>
```

이때:

```text
App.jsx
→ 페이지별 허용 역할 정의

ProtectedRoute
→ 현재 user.role과 허용 roles 비교
```

`roles`를 전달하지 않으면 로그인 여부만 검사한다.

예:

```jsx
<ProtectedRoute>
  <LoansPage />
</ProtectedRoute>
```

위 페이지는 로그인한 사용자라면 USER/MANAGER/ADMIN 모두 접근 가능하다.

### 프론트 권한과 백엔드 권한의 차이

중요하게 배운 점:

**ProtectedRoute는 보안의 최종 방어선이 아니다.**

프론트 권한 검사는 화면 접근 UX를 제어한다.
사용자는 브라우저 개발자 도구나 직접 HTTP 요청으로 프론트 코드를 우회할 수 있기 때문이다.

실제 보안은 Spring Security에서 API 요청 자체를 차단해야 한다.

```text
Frontend ProtectedRoute
→ 화면 접근 제어 / UX

Backend Spring Security
→ 실제 API 인가 / 보안
```

### Role 기반 인가

Role:

```text
USER
MANAGER
ADMIN
```

주요 정책:

- 일반 사용자 기능 → 인증된 사용자
- 회원 목록 / 전체 대여 / 전체 예약 → MANAGER, ADMIN
- 자산·품목·카테고리 등록 → MANAGER, ADMIN
- 삭제 기능 → ADMIN

프론트의 `roles={["ADMIN", "MANAGER"]}`와 백엔드 Security 설정을 맞추어 사용하였다.

### CSRF 적용

세션 기반 인증에서는 브라우저가 쿠키를 자동으로 전송하기 때문에 CSRF 공격을 고려해야 한다.

`CookieCsrfTokenRepository.withHttpOnlyFalse()`를 사용하여 CSRF 토큰을 쿠키로 제공하고,
프론트의 상태 변경 요청에서 토큰을 헤더에 넣도록 구성하였다.

```jsx
const csrfToken = await getCsrfToken();

await fetch("/api/...", {
  method: "POST",
  headers: {
    "X-XSRF-TOKEN": csrfToken,
  },
});
```

중요한 점:

- `permitAll()`은 "로그인하지 않아도 접근 가능"이라는 뜻이다.
- `permitAll()`이라고 해서 CSRF 검사가 자동으로 비활성화되는 것은 아니다.
- 로그인, 회원가입처럼 공개 API라도 POST 요청이면 CSRF 토큰이 필요할 수 있다.

### JSESSIONID와 XSRF-TOKEN 차이

- `JSESSIONID`
  - 서버 세션을 식별하는 쿠키
  - "어떤 로그인 세션인가"를 확인
- `XSRF-TOKEN`
  - CSRF 방어를 위한 토큰
  - "이 상태 변경 요청이 정상 페이지 흐름에서 만들어진 요청인가"를 검증

둘은 목적이 다르다.

### 로그아웃

로그아웃은 DB의 회원 데이터를 삭제하거나 수정하는 비즈니스 로직이 아니다.
현재 로그인 세션과 SecurityContext를 정리하는 인증 상태 변경이다.

```java
@PostMapping("logout")
public void logout(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
) {
    new SecurityContextLogoutHandler()
            .logout(request, response, authentication);
}
```

그래서 별도의 Service/Repository 없이 Controller에서 Security logout handler를 사용하였다.

프론트에서는 로그아웃 성공 후:

```jsx
setUser(null);
navigate("/login");
```

을 수행해 React 로그인 상태도 함께 초기화한다.

### 로그인 UI / 회원가입 구조 정리

- 기존 회원 생성 페이지를 `SignupPage`로 명확하게 분리
- `/signup` 공개 Route 사용
- 회원가입 성공 후 로그인 페이지로 이동
- 일반 회원가입에서는 Role을 USER로 생성
- 비밀번호 확인 값은 프론트 검증용이며 서버 Request DTO에는 포함하지 않음
- 로그인/회원가입 화면 스타일을 동일한 인증 UI 계열로 정리

### Sidebar / Header 권한 UI

- USER와 MANAGER/ADMIN 메뉴를 구분
- MANAGER에게 ADMIN 전용 삭제 버튼이 보이지 않도록 처리
- 로그아웃 버튼은 로그인 상태일 때만 표시
- Header 페이지 제목 보완

### AuthContext의 loading이 필요한 이유

React 새로고침 시 `user`의 초기값은 `null`이다.
하지만 서버 세션까지 로그아웃된 것은 아니다.

`/me` 응답을 받기 전에 `user === null`만 보고 로그인 화면을 렌더링하면 잠깐 로그인 화면이 보였다가 다시 로그인 상태로 바뀌는 깜빡임이 생길 수 있다.

그래서:

```text
초기 상태
user = null
loading = true

/me 완료
→ 성공: user 설정
→ 실패: user는 null 유지
→ finally: loading = false
```

구조로 처리하였다.

### useEffect와 로그인 복구

`AuthProvider`가 처음 렌더링될 때 `/api/auth/me`를 한 번 호출한다.

```jsx
useEffect(() => {
  const loadUser = async () => {
    ...
  };

  loadUser();
}, []);
```

`[]`이므로 최초 mount 시 한 번 실행된다.

여기서 `useEffect`는 버튼 클릭 같은 직접 이벤트가 아니라,
컴포넌트 렌더링 이후 자동으로 수행되어야 하는 side effect를 처리하는 용도다.

---

## 2026-08-16 - 로그인 사용자 소유권 검증 보완

### 문제 발견

Spring Security 로그인과 Role 기반 인가를 구현했지만,
일부 대여·예약 API는 여전히 프론트에서 `memberId`를 받아 처리하고 있었다.

예:

```json
{
  "memberId": 3,
  "assetItemId": 10
}
```

이 구조에서는 실제 로그인 사용자가 1번 회원이어도 요청 body의 `memberId`를 3으로 바꾸면 다른 회원 명의로 요청할 가능성이 있다.

따라서 인증을 적용한 이후에는 일반 사용자의 "내 데이터" 처리에서 클라이언트가 보내는 `memberId`를 신뢰하면 안 된다.

### 핵심 원칙

```text
내 데이터 처리 API
→ memberId를 클라이언트에게 받지 않는다.
→ Authentication의 principal에서 현재 로그인 Member를 꺼낸다.
```

반대로 관리자 기능처럼 특정 사용자를 대상으로 조회해야 하는 API에서는 `memberId`를 요청 값으로 받을 수 있다.

### 대여 생성 소유권 보완

#### 개선 전

`LoanCreateRequest`:

```java
private Long memberId;
private Long assetItemId;
```

Service:

```java
Member member = memberRepository.findById(request.getMemberId())
        .orElseThrow(...);
```

문제:

- 요청 body의 `memberId`는 사용자가 임의로 변경 가능
- 로그인한 사용자와 request의 memberId가 일치한다는 보장이 없음

#### 개선 후

`LoanCreateRequest`에서 `memberId` 제거:

```java
@NotNull
private Long assetItemId;
```

Controller에서 로그인 Member 추출:

```java
@PostMapping
public LoanCreateResponse createLoan(
        @Valid @RequestBody LoanCreateRequest request,
        Authentication authentication
) {
    CustomUserDetails userDetails =
            (CustomUserDetails) authentication.getPrincipal();

    Member member = userDetails.getMember();

    return loanService.createLoan(member, request);
}
```

Service:

```java
public LoanCreateResponse createLoan(
        Member member,
        LoanCreateRequest request
)
```

프론트 요청도:

```json
{
  "assetItemId": 10
}
```

만 보내도록 변경하였다.

### 반납 요청 소유권 보완

#### 개선 전

```text
POST /api/loans/{loanId}/return-request?memberId=3
```

Service에서는:

```java
if (!loan.getMember().getId().equals(memberId)) {
    throw new IllegalStateException(...);
}
```

로 비교하고 있었지만, 이 `memberId` 자체를 사용자가 조작할 수 있었다.

#### 개선 후

Controller에서 Authentication으로 Member를 꺼내 Service에 전달:

```java
return loanService.requestReturn(loanId, member);
```

Service:

```java
if (!loan.getMember().getId().equals(member.getId())) {
    throw new IllegalStateException("본인의 대여만 반납 요청할 수 있습니다.");
}
```

이제 비교 대상의 `member`는 서버 인증 정보를 통해 얻은 사용자이므로 요청자가 임의로 바꿀 수 없다.

### 내 대여 목록 조회 보완

#### 개선 전

```text
GET /api/loans/members/{memberId}
```

프론트:

```jsx
fetch(`/api/loans/members/${user.memberId}`);
```

URL의 memberId를 바꾸면 다른 사용자의 목록을 요청할 가능성이 있었다.

#### 개선 후

```text
GET /api/loans/my
```

Controller가 현재 로그인 Member의 ID를 직접 사용:

```java
return loanService.findLoansByMember(member.getId());
```

프론트는 더 이상 user.memberId를 URL에 넣지 않는다.

```jsx
fetch("/api/loans/my");
```

### 예약 생성 소유권 보완

`ReservationCreateRequest`에서도 `memberId`를 제거하고 `assetItemId`만 받도록 변경하였다.

Controller에서 Authentication의 Member를 꺼내:

```java
reservationService.createReservation(member, request);
```

형태로 전달하였다.

Service는 더 이상:

```java
memberRepository.findById(request.getMemberId())
```

를 호출하지 않는다.

### 내 예약 목록 조회 보완

#### 개선 전

```text
GET /api/reservations/members/{memberId}
```

#### 개선 후

```text
GET /api/reservations/my
```

Controller가 현재 로그인 Member ID를 기준으로 조회한다.

프론트에서도:

```jsx
fetch("/api/reservations/my");
```

로 변경하고, URL 구성을 위해 사용하던 `AuthContext.user.memberId` 의존성을 제거하였다.

### 예약 취소 소유권 검증

기존 예약 취소는 `reservationId`만 알면 Service가 해당 예약을 취소했다.

```java
cancelReservation(Long reservationId)
```

이를:

```java
cancelReservation(Long reservationId, Member member)
```

로 변경하고 실제 예약 소유자와 로그인 사용자를 비교하였다.

```java
if (!reservation.getMember().getId().equals(member.getId())) {
    throw new IllegalStateException("본인의 예약만 취소할 수 있습니다.");
}
```

예약 소유자가 아니면 취소 요청을 거부한다.

### 소유권 검증에서 배운 점

`Role` 검사와 `Ownership` 검사는 다른 문제다.

예를 들어 USER가 대여 기능을 사용할 권한이 있는 것은 Role 인가 문제다.
그러나 "이 USER가 이 대여 기록의 실제 소유자인가"는 별도의 소유권 검증 문제다.

```text
Role / Authorization
→ 이 기능을 사용할 수 있는 역할인가?

Ownership
→ 이 데이터가 실제로 현재 로그인 사용자의 것인가?
```

Spring Security의 URL 권한 설정만으로는 데이터 소유권까지 자동으로 검증되지 않는다.
Service 로직에서 현재 인증 사용자와 엔티티의 소유자를 비교해야 한다.

### 프론트에서 memberId를 제거한 이유

프론트의 값은 신뢰할 수 없는 입력이다.

React state에 저장된:

```jsx
user.memberId;
```

도 정상 UI 흐름에서는 올바른 값이지만,
사용자가 브라우저 개발자 도구나 직접 HTTP 요청을 사용하면 요청값 자체를 바꿀 수 있다.

따라서 보안 판단은 반드시 서버에서 해야 한다.

### DTO 설계 관점에서 다시 배운 점

초기 프로젝트에서는 연관관계를 연결하기 위해 Request DTO에 `memberId`, `assetItemId`를 모두 받았다.
하지만 인증 기능이 추가되면서 DTO 설계 기준이 달라졌다.

- 사용자가 선택해야 하는 대상 ID
  - 예: `assetItemId`
  - Request DTO에 포함
- 서버가 인증 정보로 이미 알고 있는 ID
  - 예: 현재 로그인 사용자의 `memberId`
  - Request DTO에 포함하지 않음

즉 "연관관계가 있으니 무조건 모든 id를 Request DTO로 받는다"가 아니라,
**누가 결정해야 하는 값인지**를 기준으로 DTO를 설계해야 한다.

### 현재 보완된 소유권 영역

대여:

- 대여 생성
- 반납 요청
- 내 대여 목록 조회

예약:

- 예약 생성
- 내 예약 목록 조회
- 예약 취소

모두 프론트가 임의의 memberId를 넘겨 일반 사용자 데이터를 처리하지 않도록 변경하였다.

---

## 이번 보안 작업에서 면접 전에 복습할 질문

### Spring Security

1. `AuthenticationManager`는 무슨 역할을 하는가?
2. `DaoAuthenticationProvider`는 무엇을 검증하는가?
3. `UserDetailsService`와 `UserDetails`의 역할 차이는 무엇인가?
4. 왜 Member 엔티티를 바로 쓰지 않고 `CustomUserDetails`를 만들었는가?
5. `Authentication.getPrincipal()`에는 무엇이 들어있는가?
6. `SecurityContext`와 `HttpSession`은 어떤 관계인가?
7. 새로고침 후에도 로그인 상태가 유지되는 이유는 무엇인가?
8. `JSESSIONID`는 어떤 역할을 하는가?
9. `hasRole()`과 실제 `ROLE_` authority는 어떤 관계인가?
10. 401과 403의 차이는 무엇인가?

### CSRF

1. 세션 인증에서 CSRF가 왜 중요한가?
2. `permitAll()`인데도 POST 로그인 요청에서 CSRF 토큰이 필요한 이유는 무엇인가?
3. `JSESSIONID`와 `XSRF-TOKEN`의 차이는 무엇인가?
4. GET 요청에는 왜 일반적으로 CSRF 토큰을 넣지 않는가?
5. 상태를 변경하는 POST/DELETE 요청에서는 왜 CSRF 헤더가 필요한가?

### React 인증 상태

1. React Context를 왜 사용했는가?
2. `createContext`, `Provider`, `useContext` 각각의 역할은 무엇인가?
3. `children`은 무엇인가?
4. `user`와 `loading`을 왜 따로 두었는가?
5. 새로고침하면 React state는 초기화되는데 로그인은 왜 유지되는가?
6. AuthProvider의 `useEffect(..., [])`는 언제 실행되는가?
7. ProtectedRoute는 실제 보안인가, UX 제어인가?
8. App.jsx의 `roles`와 AuthContext의 `user.role`은 각각 어디서 오는가?

### 소유권 보안

1. 로그인 인증을 붙였는데도 왜 `memberId` 조작 취약점이 남을 수 있는가?
2. Role 인가와 데이터 소유권 검증의 차이는 무엇인가?
3. 왜 `memberId`를 Request DTO에서 제거했는가?
4. `assetItemId`는 계속 Request DTO에 남겨도 되는 이유는 무엇인가?
5. `/members/{memberId}` 대신 `/my` API를 사용한 이유는 무엇인가?
6. 예약 취소에서 왜 `reservation.member.id`와 로그인 Member ID를 비교해야 하는가?
7. 클라이언트 입력을 신뢰하면 안 된다는 말은 실제 코드에서 무엇을 의미하는가?

---

## 추후 개선 / 아직 남은 과제

- 개발 DB와 테스트 DB 분리
- `application-local`, `application-test`, 운영 환경 설정 분리
- DB 계정/비밀번호 환경변수 처리
- `ddl-auto=create` 운영 사용 금지 및 테스트 환경 재정리
- 운영 프론트/백엔드 연결 구조 확정
- 로그인 시 세션 fixation 보호 여부 확인
- `SUSPENDED` 회원 로그인 정책 결정
- OVERDUE 상태에서도 반납 요청 UI가 가능하도록 보완
- READY 예약의 취소 및 만료 정책 보완
- 인증/인가/CSRF/소유권 통합 테스트 추가
- `IllegalArgumentException` 등 공통 예외 응답 정리
- Validation 및 DB unique 제약 보완
- README에 인증 구조, 권한표, 테스트 계정, 실행 방법, 배포 구조 추가
- Git 변경사항 정리 및 커밋
- AWS 배포 구조 설계
- 시간 여유가 있을 경우 대여/예약 동시성 제어 검토

## 2026-08-18

### 대여/예약 사용자 상태 처리 개선

- AssetItem 응답에 hasReadyReservation, readyByMe, borrowedByMe, reservedByMe 추가
- READY 예약 존재 여부와 현재 로그인 사용자 소유 여부를 구분
- 예약 신청 화면에서 본인 대여 품목 및 이미 예약한 품목의 신청 버튼 비활성화
- 대여 화면에서 READY 우선권이 있는 사용자만 대여 가능하도록 프론트 표시 조건 보완
- WAITING/READY 중복 예약 조회를 ReservationStatusIn 기반으로 정리

### Reservation LazyInitializationException 해결

- SecurityContext에 보관된 Member가 현재 영속성 컨텍스트에서 detached 상태일 수 있음을 확인
- Reservation 생성 시 로그인 Member ID로 Member를 다시 조회하여 managed entity 사용
- 양방향 연관관계 설정 중 Member.reservations LAZY 컬렉션 접근 오류 해결

### 관리자 자산 품목 기능 보완

- 사용자용 AssetItemResponse와 관리자용 AssetItemAdminResponse 분리
- 관리자 자산 품목 전체 조회 API 복구
- 자산 품목 시리얼번호 / 자산명 / 상태 검색 기능 추가
- 관리자 자산 관리 화면의 검색 toolbar 및 상세 화면 UI 정리

### 관리자 UI 개선

- 검색/필터 input, select, button 스타일 통일
- Sidebar 메뉴명 및 active/open 상태 로직 정리
- 여러 Sidebar 그룹을 독립적으로 펼쳐둘 수 있도록 개선
- 예약일 표시를 YYYY-MM-DD HH:mm 형식으로 통일
- ADMIN 화면에서 불필요한 사용자 메뉴 노출 정리

### 회원 개인 정보 관리 기능 추가

- GET /api/members/me 내 정보 조회
- PATCH /api/members/me 이메일 수정
- 현재 비밀번호 BCrypt 검증 후 개인정보 변경
- PATCH /api/members/me/password 비밀번호 변경
- 새 비밀번호 BCrypt 인코딩 적용
- 8~16자 비밀번호 validation 추가
- /me 프론트 페이지 및 Header 진입점 추가
- ADMIN / MANAGER / USER 모두 본인 정보 접근 가능

## 2026-08-19

### 부서 관리 기능 추가

- Department CRUD 구현
  - 부서 목록 조회
  - 부서 등록
  - 부서명 수정
  - 부서 삭제
- 사용 중인 부서는 삭제할 수 없도록 검증 추가
- 관리자용 부서 관리 페이지 추가
- `/admin/departments` 라우트 및 사이드바 메뉴 추가
- ADMIN / MANAGER가 부서 관리 API에 접근 가능하도록 Security 설정

### 관리자 회원 관리 개선

- 회원 검색 응답에 부서 정보 추가
  - departmentId
  - departmentName
- Querydsl 회원 검색에 Department LEFT JOIN 적용
- 관리자 회원 수정 API 추가
  - 소속 부서 지정 / 변경
  - 회원 상태 ACTIVE / SUSPENDED 변경
- 회원 Role 변경 기능은 제외
- 관리자 회원 관리 페이지에 인라인 수정 기능 추가
- ADMIN만 회원 정보를 수정할 수 있도록 권한 제한
- MANAGER에서는 회원 수정 버튼을 노출하지 않도록 UI 개선

### 회원 상태 및 Spring Security 연동

- MemberStatus를 ACTIVE / SUSPENDED 기준으로 정리
- CustomUserDetails의 `isEnabled()`와 MemberStatus 연동
- SUSPENDED 회원 로그인 차단
- Spring Security에서 SUSPENDED 로그인 시 `DisabledException`이 발생하는 것을 직접 확인
- `DisabledException`과 일반 `AuthenticationException`을 구분하여 로그인 실패 메시지 처리
  - 정지 계정: "계정이 정지되었습니다. 관리자에게 문의하세요."
  - 일반 인증 실패: "아이디 또는 비밀번호가 일치하지 않습니다."

### 로그인 요청 Validation 추가

- LoginRequest의 loginId, password에 `@NotBlank` 적용
- AuthController 로그인 요청에 `@Valid` 적용
- 빈 아이디 / 비밀번호 요청이 인증 로직까지 진입하지 않도록 검증

### 마이페이지 개선

- 내 정보 조회 응답에 소속 부서명 추가
- 마이페이지에서 자신의 소속 부서 확인 가능
- ADMIN / MANAGER 권한을 배지 형태로 표시
- 일반 USER는 권한 표시 생략
- 기존 이메일 수정 / 비밀번호 변경 기능 유지
- 비밀번호 변경 후 세션 종료 및 재로그인 처리 확인

## 2026-08-21 - 자산 관리 보완 / 대표 이미지 / 핵심 테스트 정비

### 자산 및 자산 품목 수정

- 자산(Asset) 수정 기능 추가
  - 자산명
  - 설명
  - 카테고리 변경
- 자산 품목(AssetItem) 수정 기능 추가
  - 시리얼번호
  - 위치
  - 소속 Asset 변경
- `RENTED`, `DISPOSED` 상태의 AssetItem 수정 제한
- 관리자 AssetItem UI에서 상태별 수정/폐기 가능 여부를 백엔드 정책과 맞춤

### 대표 이미지 기능

- 자산당 대표 이미지 0~1개 구조 적용
- 자산 등록 시 선택적 이미지 업로드
- 자산 상세에서 이미지 조회
- 이미지가 없으면 기존 `AF` placeholder 유지
- ADMIN/MANAGER 이미지 교체 가능
- ADMIN만 이미지 삭제 가능
- 로컬 파일 시스템 `uploads/assets` 사용
- UUID 기반 저장 파일명 적용
- `/uploads/**` 정적 리소스 매핑 및 Vite Proxy 적용
- 업로드 크기 제한
  - 파일 최대 5MB
  - 요청 최대 6MB
- 이미지 교체 순서를 `새 이미지 저장 → imagePath 변경 → 기존 이미지 삭제`로 변경
- 새 파일 저장 실패 시 기존 이미지부터 사라지는 직접적인 위험을 줄임

### 사용자 자산 상세 흐름

- 일반 USER도 자산 상세 조회 가능하도록 프론트 접근 권한 조정
- 대여 신청 화면에서 자산 상세 화면으로 이동할 수 있도록 흐름 추가
- 관리자용 수정/이미지 관리 UI는 Role에 따라 노출
- 프론트 Route 접근 제어와 백엔드 Security 인가를 별도로 점검

### 권한 / JPA 오류 보완

- USER가 관리자용 `GET /api/asset-items` 전체 목록을 직접 조회하지 못하도록 백엔드 권한 보완
- 사용자용 AssetItem 조회는 유지
- `MemberService.getMyInfo()`에서 세션 principal의 detached Member 연관관계를 직접 접근하지 않고, 현재 트랜잭션에서 다시 조회한 managed Member를 사용하도록 수정
- `open-in-view: false` 환경에서 LAZY 연관관계 접근 시 영속 상태가 중요하다는 점을 다시 확인
- `IllegalArgumentException`이 500으로 처리될 수 있던 부분을 공통 400 응답 처리에 포함

### 테스트 환경 분리

기존에는 개발 실행과 테스트 실행이 모두 같은 MySQL `assetflow` DB를 사용하고,
`ddl-auto: create` 설정 때문에 테스트 실행 시 개발 DB를 초기화할 위험이 있었다.

개선 후:

```text
개발 환경
DB: assetflow
ddl-auto: update

테스트 환경
DB: assetflow_test
ddl-auto: create-drop
```

- MySQL에 `assetflow_test` 테스트 전용 DB 생성
- `src/test/resources/application.yml`에서 테스트 DB 사용
- 테스트 종료 시 테스트 스키마를 정리하도록 `create-drop` 적용
- 개발 실행에서는 기존 데이터를 유지하도록 `ddl-auto: update` 적용

### 테스트 데이터 구성 방식

test profile에서 대량의 샘플 데이터를 자동 생성하기보다,
각 ServiceTest에서 해당 시나리오에 필요한 최소 엔티티만 직접 준비하는 방식으로 정리했다.

공통 테스트 데이터:

- Member
- Category
- Asset
- AssetItem

테스트 클래스에는 `@Transactional`을 적용해 테스트 종료 후 변경 내용이 rollback되도록 했다.

### JPA 테스트 복습

#### `new`와 `persist`

```java
Member member = new Member(...);
```

- 일반 자바 객체
- 아직 JPA 관리 대상이 아님

```java
em.persist(member);
```

- 영속성 컨텍스트의 관리 대상(영속 상태)으로 등록
- flush 시점에 SQL이 DB에 반영될 수 있음
- 영속 상태 엔티티의 변경은 dirty checking 대상이 됨

#### Entity와 Response DTO의 차이

Entity:

```text
JPA가 영속성 컨텍스트에서 관리
→ 트랜잭션 안에서 상태 변경 추적 가능
```

Response DTO:

```text
응답 생성 시점의 값을 복사한 스냅샷
→ 이후 Entity 상태가 바뀌어도 자동 갱신되지 않음
```

예를 들어 `LoanCreateResponse`가 생성 당시 `RENTED`였다면,
반납 승인 후 실제 Loan이 `RETURNED`가 되어도 기존 `LoanCreateResponse`의 값은 그대로다.

상태 변경 후 실제 엔티티 상태를 확인해야 하는 테스트에서는:

```java
Reservation reservation =
        em.find(Reservation.class, reservationId);
```

처럼 엔티티를 조회해 검증했다.

### LoanService 핵심 테스트

1. 대여 성공
   - Loan → `RENTED`
   - AssetItem → `RENTED`

2. 반납 요청
   - Loan → `RETURN_REQUESTED`

3. 반납 승인
   - Loan → `RETURNED`
   - AssetItem → `AVAILABLE`

4. 타인의 반납 요청 실패
   - 대여 소유자가 아닌 사용자의 반납 요청 차단
   - 예외 메시지까지 검증

5. READY 예약자 대여 성공
   - 기존 사용자 대여
   - 다른 사용자 예약 → `WAITING`
   - 기존 사용자 반납 승인 → 예약 `READY`
   - READY 예약자가 실제 대여 가능

6. READY 예약자가 아닌 사용자 대여 실패
   - READY 예약자가 존재하는 AssetItem을 다른 사용자가 대여하려 하면 예외

### ReservationService 핵심 테스트

1. 대여 중인 자산 예약 성공
   - `RENTED` AssetItem 예약
   - Reservation → `WAITING`

2. 중복 예약 실패
   - 같은 회원의 동일 AssetItem `WAITING/READY` 중복 예약 차단

3. 본인 대여 품목 예약 실패
   - 자신의 활성 Loan이 있는 AssetItem 예약 차단

4. 대여 중이 아닌 자산 예약 실패
   - `AVAILABLE` AssetItem 예약 차단

5. READY 예약 취소 후 다음 예약자 승격
   - member2 → `WAITING`
   - member3 → `WAITING`
   - 반납 승인 후 member2 → `READY`
   - member2 취소 → `CANCELED`
   - member3 → `READY`

### 전체 테스트 / 빌드 확인

```powershell
.\gradlew.bat test
```

결과:

```text
BUILD SUCCESSFUL
```

```powershell
.\gradlew.bat clean build
```

결과:

```text
BUILD SUCCESSFUL
```

확인한 범위:

- main 코드 컴파일
- test 코드 컴파일
- Loan/Reservation 핵심 테스트 실행
- 테스트 DB 분리
- 전체 Gradle build 및 jar 패키징 가능

### 현재 테스트 전략

테스트 개수를 늘리는 것보다 포트폴리오의 핵심 비즈니스 규칙을 우선했다.

현재 테스트가 보여주는 내용:

- 상태 전이
- 데이터 소유권 검증
- 예약 우선권
- 중복 예약 차단
- 반납 승인 후 여러 엔티티의 연쇄 상태 변경

추가 테스트는 필요 시 다음 정도만 고려한다.

- SUSPENDED 회원 로그인 실패
- USER의 관리자 API 접근 시 403
- 비밀번호 변경 후 세션 종료

### 아직 남은 작업

- 이미지 파일 서버 측 형식 검증
- 자산 삭제 시 대표 이미지 실제 파일 정리
- 일부 UX/에러 처리 보완
- 운영 profile / 환경변수 정리
- 실제 배포
- README / 포트폴리오 문서 최종 정리

## 2026-08-23 - 배포 전 UI/UX 마감 및 DB 무결성 보강

### 1. 배포 전 전체 점검

- Codex를 이용해 배포 직전 기준으로 전체 프로젝트를 점검했다.
- Backend test/build, Frontend lint/build 상태를 확인했다.
- 기능 추가보다는 배포 차단 요소와 UI/UX 일관성 중심으로 점검했다.

### 2. UI/UX 정리

- 관리자/매니저 Dashboard에서 사용자 메뉴가 노출되지 않도록 역할별 메뉴를 분리했다.
- Sidebar의 `회원 관리` 명칭을 `회원/조직 관리`로 변경했다.
- 자산 카드의 상세보기 버튼이 카드 전체 너비를 차지하던 UI를 수정했다.
- 전체 관리자 화면의 버튼 크기, 색상, 간격, hover/focus/disabled 스타일을 통일했다.
- 테이블의 수정/삭제/저장/취소 버튼 정렬과 간격을 정리했다.
- 회원 수정 시 select와 버튼 렌더링 때문에 컬럼 폭이 흔들리던 문제를 수정했다.
- 관리자 목록에서 내부 DB PK 컬럼을 제거했다.
  - 자산번호
  - 품목번호
  - 대여번호
  - 예약번호
  - 회원번호
  - 부서번호
- 사용자 화면에서도 내부 PK 노출을 정리했다.
- 모바일 화면에서 Sidebar를 그대로 노출하지 않고 햄버거/드로어 형태로 개선하는 방향을 정리했다.

### 3. Frontend Validation 보완

- 로그인/회원가입 화면의 validation을 Backend Bean Validation 기준과 맞췄다.
- MyPage의 이메일 수정/비밀번호 변경 validation을 보완했다.
- Backend의 `@NotBlank`, `@Email`, `@Size(min=8, max=16)` 조건과 Frontend 검증 규칙을 일치시켰다.
- 비밀번호 확인은 Frontend 전용 UX 검증으로 유지했다.

### 4. 이미지/자산 삭제 정리

- 자산 삭제 시 연결된 AssetItem이 있으면 삭제를 차단하도록 했다.
- 자산 삭제 시 대표 이미지 실제 파일도 함께 정리하도록 처리했다.
- 이미지 Content-Type 및 확장자 검증을 적용했다.
- `backend/uploads/`가 Git에 포함되지 않도록 정리했다.

### 5. DB 무결성 보강

- `Member.loginId`에 UNIQUE 제약을 적용했다.
- `AssetItem.serialNumber`에 UNIQUE 제약을 적용했다.
- Service 사전 중복 검사와 별도로 DB가 최종적으로 중복 데이터를 차단하도록 했다.
- 기존 `ddl-auto: update`에서 Entity의 `unique = true`가 기존 테이블에 자동 반영되지 않아 MySQL 스키마에 직접 UNIQUE 제약을 적용했다.

### 6. 현재 상태

- 새로운 핵심 기능 개발은 종료 단계다.
- 남은 주요 작업은 운영 profile/환경변수 설정, uploads 영구 저장 방식 결정, 최종 Git 정리, 실제 배포, smoke test, README/포트폴리오 정리다.
