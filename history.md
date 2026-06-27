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

### 부족한 점 / 추후 학습 필요

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

### 부족한 점 / 추후 학습 필요

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
- URL PathVariable 방식과 RequestBody DTO 방식의 차이를 이해했다.x

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

### 부족한 점 / 추후 학습 필요

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

### 부족한 점 / 추후 개선 필요

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

### 부족한 점 / 추후 개선 필요
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

### 부족한 점 / 추후 개선
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

### 부족한 점 / 추후 개선
- 테스트 데이터 생성 코드가 중복되어 추후 TestFixture로 분리 필요
- 테스트 메서드명이 아직 더 명확해질 필요 있음
- 연체 Scheduler 테스트는 아직 미작성
- Controller 테스트는 아직 미작성
- Querydsl, JWT, 배포 작업이 남아 있음