# AssetFlow

사내 자산 대여·예약·반납 관리 서비스

## 배포

- URL: http://43.202.236.170
- 관리자: admin / admin1234
- 사용자: user01 ~ user16 / test1234

## 프로젝트 정보

- 기간: 2026.06 ~ 2026.08
- 인원: 개인 프로젝트

## 프로젝트 소개

AssetFlow는 사내 자산과 개별 품목을 관리하고,
사용자의 대여·예약·반납 요청과 관리자의 승인 과정을 처리하는 서비스입니다.

## 기술 스택

### Backend

Java 17, Spring Boot, Spring Data JPA, Spring Security, QueryDSL, MySQL

### Frontend

React, JavaScript, Vite

### Deployment

Docker, AWS EC2

## ERD 구조

![ERD](./erd1.png)

## 핵심 기능

- 자산(Asset)과 개별 품목(AssetItem) 관리
- 대여 및 반납 요청/승인
- 예약 대기열 및 대여 우선권 관리
- 회원 및 부서 관리
- 역할별 접근 제어
- QueryDSL 기반 검색 및 페이지네이션
- 연체 상태 처리

## 테스트

대여·예약의 상태 전이와 소유권 검증을 중심으로 서비스 테스트를 작성했습니다.

- 대여 성공 및 상태 변경
- 타인의 반납 요청 차단
- READY 예약자의 우선 대여
- READY 예약자가 아닌 사용자의 대여 차단
- 중복 예약 차단
- READY 예약 취소 후 다음 예약자 승격
