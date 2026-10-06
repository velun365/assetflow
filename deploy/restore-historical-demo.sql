-- Historical demo restoration: users from 2026-08-26 seed; assets from 2026-09-08 server snapshot.
-- Run only through restore-empty-demo.py with backend stopped. No loan/reservation records.
SET NAMES utf8mb4;
USE assetflow;
START TRANSACTION;
CREATE TEMPORARY TABLE restore_empty_guard (n BIGINT CHECK (n=0));
INSERT INTO restore_empty_guard SELECT (SELECT COUNT(*) FROM member)+(SELECT COUNT(*) FROM department)+(SELECT COUNT(*) FROM category)+(SELECT COUNT(*) FROM asset)+(SELECT COUNT(*) FROM asset_item)+(SELECT COUNT(*) FROM loan)+(SELECT COUNT(*) FROM reservation);

INSERT INTO department (department_id,name) VALUES
('1','경영지원팀'),
('2','인사팀'),
('3','재무회계팀'),
('4','정보기술팀'),
('5','제품개발팀'),
('6','영업팀'),
('7','고객지원팀');
INSERT INTO category (category_id,name) VALUES
('1','전자기기'),
('2','문서'),
('3','도서'),
('4','사무용품'),
('5','가구'),
('6','네트워크장비'),
('7','회의장비');
INSERT INTO member (member_id,login_id,email,password,name,role,status,department_id) VALUES
('1','admin',NULL,'$2a$10$OlMg4Q7VIZfQgVuacJWbAe/r7wGhWesZS8bV5J2G.QGIbXccy3KtG','관리자','ADMIN','ACTIVE',NULL),
('2','manager',NULL,'$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','매니저','MANAGER','ACTIVE',NULL),
('3','user01','flowuser01@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','김민준','USER','ACTIVE','1'),
('4','user02','flowuser02@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','이서연','USER','ACTIVE','2'),
('5','user03','flowuser03@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','박지훈','USER','ACTIVE','3'),
('6','user04','flowuser04@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','최유진','USER','ACTIVE','4'),
('7','user05','flowuser05@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','정현우','USER','ACTIVE','5'),
('8','user06','flowuser06@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','한수빈','USER','SUSPENDED','6'),
('9','user07','flowuser07@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','윤도현','USER','ACTIVE','7'),
('10','user08','flowuser08@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','송예린','USER','ACTIVE','1'),
('11','user09','flowuser09@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','강준호','USER','ACTIVE','2'),
('12','user10','flowuser10@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','조하은','USER','ACTIVE','3'),
('13','user11','flowuser11@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','임재현','USER','ACTIVE','4'),
('14','user12','flowuser12@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','오지민','USER','ACTIVE','5'),
('15','user13','flowuser13@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','신동욱','USER','ACTIVE','6'),
('16','user14','flowuser14@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','권나연','USER','SUSPENDED','7'),
('17','user15','flowuser15@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','황성민','USER','ACTIVE','1'),
('18','user16','flowuser16@naver.com','$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq','안채원','USER','ACTIVE','2');
INSERT INTO asset (asset_id,name,explanation,category_id) VALUES
('100','삼성 갤럭시북4 Pro 16','개발 및 일반 사무 업무용 Windows 노트북','1'),
('101','Cisco Catalyst 9200L','사내 유선 네트워크 구성을 위한 관리형 스위치','6'),
('102','Logitech MX Keys S','업무용 무선 키보드','4'),
('103','Logitech Rally Bar','중형 회의실 화상회의 장비','7'),
('104','시디즈 T50 Air','장시간 사무 업무용 메쉬 의자','5'),
('105','토비의 스프링','Java 개발 역량 강화를 위한 사내 공용 도서','3'),
('106','2026 IT 자산 운영 가이드','사내 IT 자산 등록·대여·반납 운영 지침서','2'),
('107','Apple MacBook Pro 14 M3','디자인 및 macOS 개발 업무용 노트북','1'),
('108','Synology DS923+','팀 공용 파일 및 백업 저장용 NAS','6'),
('109','Jabra Evolve2 65','온라인 회의와 집중 업무용 무선 헤드셋','4'),
('110','Epson EB-L260F 프로젝터','대회의실 발표 및 교육용 레이저 프로젝터','7'),
('111','Real MySQL 8.0','데이터베이스 학습과 운영 참고용 공용 도서','3'),
('112','Dell UltraSharp U2723QE','개발 및 디자인 업무용 27인치 4K 모니터','1'),
('113','삼성 Galaxy Tab S9','현장 시연과 모바일 테스트용 태블릿','1'),
('117','벨루젠 웹캠',NULL,'6');
INSERT INTO asset_item (asset_item_id,serial_number,location,asset_id,asset_item_status) VALUES
('100','AF-DEMO-00000100','본사 3층 IT자산실','100','AVAILABLE'),
('101','AF-DEMO-00000101','본사 4층 개발팀','101','AVAILABLE'),
('102','AF-DEMO-00000102','본사 5층 영업팀','102','AVAILABLE'),
('103','AF-DEMO-00000103','본사 6층 회의실','103','AVAILABLE'),
('104','AF-DEMO-00000104','본사 2층 경영지원팀','104','AVAILABLE'),
('105','AF-DEMO-00000105','판교 연구소','105','AVAILABLE'),
('106','AF-DEMO-00000106','부산 지사','106','AVAILABLE'),
('107','AF-DEMO-00000107','본사 3층 IT자산실','107','AVAILABLE'),
('108','AF-DEMO-00000108','본사 4층 개발팀','108','AVAILABLE'),
('109','AF-DEMO-00000109','본사 5층 영업팀','109','AVAILABLE'),
('110','AF-DEMO-00000110','본사 6층 회의실','110','AVAILABLE'),
('111','AF-DEMO-00000111','본사 2층 경영지원팀','111','AVAILABLE'),
('112','AF-DEMO-00000112','판교 연구소','112','AVAILABLE'),
('113','AF-DEMO-00000113','부산 지사','113','AVAILABLE'),
('114','AF-DEMO-00000114','본사 3층 IT자산실','100','AVAILABLE'),
('115','AF-DEMO-00000115','본사 4층 개발팀','101','AVAILABLE'),
('116','AF-DEMO-00000116','본사 5층 영업팀','102','AVAILABLE'),
('117','AF-DEMO-00000117','본사 6층 회의실','103','AVAILABLE'),
('118','AF-DEMO-00000118','본사 2층 경영지원팀','104','AVAILABLE'),
('119','AF-DEMO-00000119','판교 연구소','105','AVAILABLE'),
('120','AF-DEMO-00000120','부산 지사','106','AVAILABLE'),
('121','AF-DEMO-00000121','본사 3층 IT자산실','107','AVAILABLE'),
('122','AF-DEMO-00000122','본사 4층 개발팀','108','AVAILABLE'),
('123','AF-DEMO-00000123','본사 5층 영업팀','109','AVAILABLE'),
('124','AF-DEMO-00000124','본사 6층 회의실','110','AVAILABLE'),
('125','AF-DEMO-00000125','본사 2층 경영지원팀','111','AVAILABLE'),
('126','AF-DEMO-00000126','판교 연구소','112','AVAILABLE'),
('127','AF-DEMO-00000127','부산 지사','113','AVAILABLE'),
('128','AF-DEMO-00000128','본사 3층 IT자산실','100','AVAILABLE'),
('129','AF-DEMO-00000129','본사 4층 개발팀','101','AVAILABLE'),
('130','AF-DEMO-00000130','본사 5층 영업팀','102','AVAILABLE'),
('131','AF-DEMO-00000131','본사 6층 회의실','103','AVAILABLE'),
('132','AF-DEMO-00000132','본사 2층 경영지원팀','104','AVAILABLE'),
('133','AF-DEMO-00000133','판교 연구소','105','AVAILABLE'),
('134','AF-DEMO-00000134','부산 지사','106','AVAILABLE'),
('135','AF-DEMO-00000135','본사 3층 IT자산실','107','AVAILABLE'),
('136','AF-DEMO-00000136','본사 4층 개발팀','108','AVAILABLE'),
('137','AF-DEMO-00000137','본사 5층 영업팀','109','AVAILABLE'),
('138','AF-DEMO-00000138','본사 6층 회의실','110','AVAILABLE'),
('139','AF-DEMO-00000139','본사 2층 경영지원팀','111','AVAILABLE'),
('140','AF-DEMO-00000140','판교 연구소','112','AVAILABLE'),
('141','AF-DEMO-00000141','부산 지사','113','AVAILABLE');
UPDATE member_seq SET next_val=(SELECT MAX(member_id)+101 FROM member);
UPDATE category_seq SET next_val=(SELECT MAX(category_id)+101 FROM category);
UPDATE department_seq SET next_val=(SELECT MAX(department_id)+101 FROM department);
UPDATE asset_seq SET next_val=(SELECT MAX(asset_id)+101 FROM asset);
UPDATE asset_item_seq SET next_val=(SELECT MAX(asset_item_id)+101 FROM asset_item);
COMMIT;
