-- Recovered verbatim from conversation 01a00f0b-7280-7382-b281-f2892b8be53d, 2026-08-26.
-- Historical candidate seed; NOT a database backup. Review before execution.
USE assetflow;
SET NAMES utf8mb4;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_assetflow_portfolio_seed_small_20260826$$

CREATE PROCEDURE sp_assetflow_portfolio_seed_small_20260826()
BEGIN
    DECLARE v_lock_acquired INT DEFAULT 0;
    DECLARE v_required_table_count INT DEFAULT 0;
    DECLARE v_missing_column_count INT DEFAULT 0;
    DECLARE v_required_fk_count INT DEFAULT 0;
    DECLARE v_unique_index_count INT DEFAULT 0;
    DECLARE v_max_seq_rows BIGINT DEFAULT 0;

    DECLARE v_department_base BIGINT DEFAULT 0;
    DECLARE v_member_base BIGINT DEFAULT 0;
    DECLARE v_category_base BIGINT DEFAULT 0;
    DECLARE v_asset_base BIGINT DEFAULT 0;
    DECLARE v_asset_item_base BIGINT DEFAULT 0;

    DECLARE v_member_count BIGINT DEFAULT 0;
    DECLARE v_member_needed INT DEFAULT 0;
    DECLARE v_asset_count BIGINT DEFAULT 0;
    DECLARE v_asset_needed INT DEFAULT 0;
    DECLARE v_asset_item_count BIGINT DEFAULT 0;
    DECLARE v_asset_item_needed INT DEFAULT 0;

    DECLARE v_password_hash VARCHAR(100)
        DEFAULT '$2a$10$kXoU4m2/kI.K2s7K.98PwOlHv74lqShq9iELJfJso.cJxm2aAxgwq';

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        DROP TEMPORARY TABLE IF EXISTS tmp_asset_item_candidates;
        DROP TEMPORARY TABLE IF EXISTS tmp_item_slots;
        DROP TEMPORARY TABLE IF EXISTS tmp_seed_assets;
        DROP TEMPORARY TABLE IF EXISTS tmp_seed_categories;
        DROP TEMPORARY TABLE IF EXISTS tmp_seed_members;
        DROP TEMPORARY TABLE IF EXISTS tmp_seed_departments;

        DO RELEASE_LOCK('assetflow_portfolio_seed_small_20260826');
        RESIGNAL;
    END;

    /*
     * 1. 동시 실행 방지
     */
    SELECT GET_LOCK(
        'assetflow_portfolio_seed_small_20260826',
        30
    )
    INTO v_lock_acquired;

    IF COALESCE(v_lock_acquired, 0) <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'AssetFlow 시드 작업용 DB 락을 획득하지 못했습니다.';
    END IF;

    /*
     * 2. 필수 테이블 사전 검증
     */
    SELECT COUNT(*)
    INTO v_required_table_count
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name IN (
          'department',
          'department_seq',
          'member',
          'member_seq',
          'category',
          'category_seq',
          'asset',
          'asset_seq',
          'asset_item',
          'asset_item_seq'
      );

    IF v_required_table_count <> 10 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '필수 테이블 또는 시퀀스 테이블이 누락됐습니다.';
    END IF;

    /*
     * 3. 필수 컬럼 사전 검증
     */
    SELECT COUNT(*)
    INTO v_missing_column_count
    FROM (
        SELECT 'department' AS table_name, 'department_id' AS column_name
        UNION ALL SELECT 'department', 'name'

        UNION ALL SELECT 'department_seq', 'next_val'

        UNION ALL SELECT 'member', 'member_id'
        UNION ALL SELECT 'member', 'department_id'
        UNION ALL SELECT 'member', 'login_id'
        UNION ALL SELECT 'member', 'email'
        UNION ALL SELECT 'member', 'password'
        UNION ALL SELECT 'member', 'name'
        UNION ALL SELECT 'member', 'role'
        UNION ALL SELECT 'member', 'status'

        UNION ALL SELECT 'member_seq', 'next_val'

        UNION ALL SELECT 'category', 'category_id'
        UNION ALL SELECT 'category', 'name'

        UNION ALL SELECT 'category_seq', 'next_val'

        UNION ALL SELECT 'asset', 'asset_id'
        UNION ALL SELECT 'asset', 'category_id'
        UNION ALL SELECT 'asset', 'name'
        UNION ALL SELECT 'asset', 'explanation'
        UNION ALL SELECT 'asset', 'image_path'

        UNION ALL SELECT 'asset_seq', 'next_val'

        UNION ALL SELECT 'asset_item', 'asset_item_id'
        UNION ALL SELECT 'asset_item', 'asset_id'
        UNION ALL SELECT 'asset_item', 'serial_number'
        UNION ALL SELECT 'asset_item', 'location'
        UNION ALL SELECT 'asset_item', 'asset_item_status'

        UNION ALL SELECT 'asset_item_seq', 'next_val'
    ) required_columns
    LEFT JOIN information_schema.columns actual_columns
      ON actual_columns.table_schema = DATABASE()
     AND actual_columns.table_name = required_columns.table_name
     AND actual_columns.column_name = required_columns.column_name
    WHERE actual_columns.column_name IS NULL;

    IF v_missing_column_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '현재 DB 컬럼 구조가 확인된 AssetFlow 스키마와 다릅니다.';
    END IF;

    /*
     * 4. 필수 FK 사전 검증
     */
    SELECT COUNT(*)
    INTO v_required_fk_count
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND referenced_table_name IS NOT NULL
      AND (
          (
              table_name = 'member'
              AND column_name = 'department_id'
              AND referenced_table_name = 'department'
              AND referenced_column_name = 'department_id'
          )
          OR
          (
              table_name = 'asset'
              AND column_name = 'category_id'
              AND referenced_table_name = 'category'
              AND referenced_column_name = 'category_id'
          )
          OR
          (
              table_name = 'asset_item'
              AND column_name = 'asset_id'
              AND referenced_table_name = 'asset'
              AND referenced_column_name = 'asset_id'
          )
      );

    IF v_required_fk_count <> 3 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Department/Member 또는 Category/Asset/AssetItem FK가 예상 구조와 다릅니다.';
    END IF;

    /*
     * 5. UNIQUE 인덱스 사전 검증
     */
    SELECT COUNT(DISTINCT index_name)
    INTO v_unique_index_count
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'member'
      AND column_name = 'login_id'
      AND non_unique = 0;

    IF v_unique_index_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'member.login_id UNIQUE 인덱스가 없습니다.';
    END IF;

    SELECT COUNT(DISTINCT index_name)
    INTO v_unique_index_count
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'asset_item'
      AND column_name = 'serial_number'
      AND non_unique = 0;

    IF v_unique_index_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'asset_item.serial_number UNIQUE 인덱스가 없습니다.';
    END IF;

    /*
     * 시퀀스 테이블은 0행 또는 1행만 허용한다.
     * 0행이면 아래 작업 마지막에 안전한 next_val 행을 생성한다.
     */
    SELECT MAX(seq_row_count)
    INTO v_max_seq_rows
    FROM (
        SELECT COUNT(*) AS seq_row_count FROM department_seq
        UNION ALL
        SELECT COUNT(*) FROM member_seq
        UNION ALL
        SELECT COUNT(*) FROM category_seq
        UNION ALL
        SELECT COUNT(*) FROM asset_seq
        UNION ALL
        SELECT COUNT(*) FROM asset_item_seq
    ) seq_counts;

    IF v_max_seq_rows > 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '하나 이상의 시퀀스 테이블에 next_val 행이 여러 개 존재합니다.';
    END IF;

    /*
     * 6. 시드 후보 데이터
     */
    CREATE TEMPORARY TABLE tmp_seed_departments (
        sort_order INT NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    ) ENGINE = MEMORY;

    INSERT INTO tmp_seed_departments (sort_order, name)
    VALUES
        (1, '경영지원팀'),
        (2, '인사팀'),
        (3, '재무회계팀'),
        (4, '정보기술팀'),
        (5, '제품개발팀'),
        (6, '영업팀'),
        (7, '고객지원팀');

    CREATE TEMPORARY TABLE tmp_seed_members (
        sort_order INT NOT NULL PRIMARY KEY,
        login_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL,
        department_order INT NOT NULL
    ) ENGINE = MEMORY;

    INSERT INTO tmp_seed_members (
        sort_order,
        login_id,
        email,
        name,
        status,
        department_order
    )
    VALUES
        (1,  'user01', 'flowuser01@naver.com', '김민준', 'ACTIVE',    1),
        (2,  'user02', 'flowuser02@naver.com', '이서연', 'ACTIVE',    2),
        (3,  'user03', 'flowuser03@naver.com', '박지훈', 'ACTIVE',    3),
        (4,  'user04', 'flowuser04@naver.com', '최유진', 'ACTIVE',    4),
        (5,  'user05', 'flowuser05@naver.com', '정현우', 'ACTIVE',    5),
        (6,  'user06', 'flowuser06@naver.com', '한수빈', 'SUSPENDED', 6),
        (7,  'user07', 'flowuser07@naver.com', '윤도현', 'ACTIVE',    7),
        (8,  'user08', 'flowuser08@naver.com', '송예린', 'ACTIVE',    1),
        (9,  'user09', 'flowuser09@naver.com', '강준호', 'ACTIVE',    2),
        (10, 'user10', 'flowuser10@naver.com', '조하은', 'ACTIVE',    3),
        (11, 'user11', 'flowuser11@naver.com', '임재현', 'ACTIVE',    4),
        (12, 'user12', 'flowuser12@naver.com', '오지민', 'ACTIVE',    5),
        (13, 'user13', 'flowuser13@naver.com', '신동욱', 'ACTIVE',    6),
        (14, 'user14', 'flowuser14@naver.com', '권나연', 'SUSPENDED', 7),
        (15, 'user15', 'flowuser15@naver.com', '황성민', 'ACTIVE',    1),
        (16, 'user16', 'flowuser16@naver.com', '안채원', 'ACTIVE',    2),
        (17, 'user17', 'flowuser17@naver.com', '문태호', 'ACTIVE',    3),
        (18, 'user18', 'flowuser18@naver.com', '배소영', 'ACTIVE',    4),
        (19, 'user19', 'flowuser19@naver.com', '백승우', 'ACTIVE',    5),
        (20, 'user20', 'flowuser20@naver.com', '서가은', 'ACTIVE',    6);

    CREATE TEMPORARY TABLE tmp_seed_categories (
        sort_order INT NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    ) ENGINE = MEMORY;

    INSERT INTO tmp_seed_categories (sort_order, name)
    VALUES
        (1, '전자기기'),
        (2, '문서'),
        (3, '도서'),
        (4, '사무용품'),
        (5, '가구'),
        (6, '네트워크장비'),
        (7, '회의장비');

    CREATE TEMPORARY TABLE tmp_seed_assets (
        sort_order INT NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        explanation VARCHAR(255) NOT NULL,
        category_name VARCHAR(255) NOT NULL
    ) ENGINE = MEMORY;

    INSERT INTO tmp_seed_assets (
        sort_order,
        name,
        explanation,
        category_name
    )
    VALUES
        (
            1,
            '삼성 갤럭시북4 Pro 16',
            '개발 및 일반 사무 업무용 Windows 노트북',
            '전자기기'
        ),
        (
            2,
            'Cisco Catalyst 9200L',
            '사내 유선 네트워크 구성을 위한 관리형 스위치',
            '네트워크장비'
        ),
        (
            3,
            'Logitech MX Keys S',
            '업무용 무선 키보드',
            '사무용품'
        ),
        (
            4,
            'Logitech Rally Bar',
            '중형 회의실 화상회의 장비',
            '회의장비'
        ),
        (
            5,
            '시디즈 T50 Air',
            '장시간 사무 업무용 메쉬 의자',
            '가구'
        ),
        (
            6,
            'Effective Java 3판',
            'Java 개발 역량 강화를 위한 사내 공용 도서',
            '도서'
        ),
        (
            7,
            '2026 IT 자산 운영 가이드',
            '사내 IT 자산 등록·대여·반납 운영 지침서',
            '문서'
        ),
        (
            8,
            'Apple MacBook Pro 14 M3',
            '디자인 및 macOS 개발 업무용 노트북',
            '전자기기'
        ),
        (
            9,
            'Synology DS923+',
            '팀 공용 파일 및 백업 저장용 NAS',
            '네트워크장비'
        ),
        (
            10,
            'Jabra Evolve2 65',
            '온라인 회의와 집중 업무용 무선 헤드셋',
            '사무용품'
        ),
        (
            11,
            'Epson EB-L260F 프로젝터',
            '대회의실 발표 및 교육용 레이저 프로젝터',
            '회의장비'
        ),
        (
            12,
            'Real MySQL 8.0',
            '데이터베이스 학습과 운영 참고용 공용 도서',
            '도서'
        ),
        (
            13,
            'Dell UltraSharp U2723QE',
            '개발 및 디자인 업무용 27인치 4K 모니터',
            '전자기기'
        ),
        (
            14,
            '삼성 Galaxy Tab S9',
            '현장 시연과 모바일 테스트용 태블릿',
            '전자기기'
        );

    CREATE TEMPORARY TABLE tmp_item_slots (
        slot_no INT NOT NULL PRIMARY KEY
    ) ENGINE = MEMORY;

    INSERT INTO tmp_item_slots (slot_no)
    VALUES (1), (2), (3), (4);

    /*
     * 7. 실제 삽입 시작
     */
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    START TRANSACTION;

    /*
     * Department: 지정된 7개 이름 중 없는 항목만 삽입
     */
    SELECT GREATEST(
        COALESCE((SELECT MAX(department_id) FROM department), 0),
        COALESCE((SELECT MAX(next_val) FROM department_seq), 0)
    ) + 100
    INTO v_department_base;

    INSERT INTO department (
        department_id,
        name
    )
    SELECT
        v_department_base + ranked.rn - 1,
        ranked.name
    FROM (
        SELECT
            candidate.name,
            ROW_NUMBER() OVER (
                ORDER BY candidate.sort_order
            ) AS rn
        FROM tmp_seed_departments candidate
        WHERE NOT EXISTS (
            SELECT 1
            FROM department existing_department
            WHERE existing_department.name = candidate.name
        )
    ) ranked;

    /*
     * Member: 기존 회원을 유지하고 총 18명까지 USER 계정으로 보충
     */
    SELECT COUNT(*)
    INTO v_member_count
    FROM member;

    SET v_member_needed = GREATEST(0, 18 - v_member_count);

    SELECT GREATEST(
        COALESCE((SELECT MAX(member_id) FROM member), 0),
        COALESCE((SELECT MAX(next_val) FROM member_seq), 0)
    ) + 100
    INTO v_member_base;

    INSERT INTO member (
        department_id,
        member_id,
        email,
        login_id,
        name,
        password,
        role,
        status
    )
    SELECT
        (
            SELECT MIN(department_id)
            FROM department
            WHERE name = department_candidate.name
        ),
        v_member_base + ranked.rn - 1,
        ranked.email,
        ranked.login_id,
        ranked.name,
        v_password_hash,
        'USER',
        ranked.status
    FROM (
        SELECT
            candidate.sort_order,
            candidate.login_id,
            candidate.email,
            candidate.name,
            candidate.status,
            candidate.department_order,
            ROW_NUMBER() OVER (
                ORDER BY candidate.sort_order
            ) AS rn
        FROM tmp_seed_members candidate
        WHERE NOT EXISTS (
            SELECT 1
            FROM member existing_member
            WHERE existing_member.login_id = candidate.login_id
        )
          AND NOT EXISTS (
            SELECT 1
            FROM member existing_member
            WHERE existing_member.email = candidate.email
        )
    ) ranked
    JOIN tmp_seed_departments department_candidate
      ON department_candidate.sort_order = ranked.department_order
    WHERE ranked.rn <= v_member_needed;

    /*
     * Category: 지정된 7개 이름 중 없는 항목만 삽입
     */
    SELECT GREATEST(
        COALESCE((SELECT MAX(category_id) FROM category), 0),
        COALESCE((SELECT MAX(next_val) FROM category_seq), 0)
    ) + 100
    INTO v_category_base;

    INSERT INTO category (
        category_id,
        name
    )
    SELECT
        v_category_base + ranked.rn - 1,
        ranked.name
    FROM (
        SELECT
            candidate.name,
            ROW_NUMBER() OVER (
                ORDER BY candidate.sort_order
            ) AS rn
        FROM tmp_seed_categories candidate
        WHERE NOT EXISTS (
            SELECT 1
            FROM category existing_category
            WHERE existing_category.name = candidate.name
        )
    ) ranked;

    /*
     * Asset: 기존 자산을 유지하고 전체 14개까지 보충
     * 새 자산의 image_path는 전부 NULL
     */
    SELECT COUNT(*)
    INTO v_asset_count
    FROM asset;

    SET v_asset_needed = GREATEST(0, 14 - v_asset_count);

    SELECT GREATEST(
        COALESCE((SELECT MAX(asset_id) FROM asset), 0),
        COALESCE((SELECT MAX(next_val) FROM asset_seq), 0)
    ) + 100
    INTO v_asset_base;

    INSERT INTO asset (
        asset_id,
        category_id,
        explanation,
        image_path,
        name
    )
    SELECT
        v_asset_base + ranked.rn - 1,
        (
            SELECT MIN(category_id)
            FROM category
            WHERE name = ranked.category_name
        ),
        ranked.explanation,
        NULL,
        ranked.name
    FROM (
        SELECT
            candidate.name,
            candidate.explanation,
            candidate.category_name,
            ROW_NUMBER() OVER (
                ORDER BY candidate.sort_order
            ) AS rn
        FROM tmp_seed_assets candidate
        WHERE NOT EXISTS (
            SELECT 1
            FROM asset existing_asset
            WHERE existing_asset.name = candidate.name
        )
    ) ranked
    WHERE ranked.rn <= v_asset_needed;

    /*
     * AssetItem: 전체 42개까지 보충
     *
     * 새 DB 또는 데이터가 적은 환경에서는 대상 Asset마다
     * 1번 슬롯부터 순차적으로 채우기 때문에 최종적으로
     * 자산당 약 3개가 균등하게 배치된다.
     */
    SELECT COUNT(*)
    INTO v_asset_item_count
    FROM asset_item;

    SET v_asset_item_needed = GREATEST(
        0,
        42 - v_asset_item_count
    );

    SELECT GREATEST(
        COALESCE((SELECT MAX(asset_item_id) FROM asset_item), 0),
        COALESCE((SELECT MAX(next_val) FROM asset_item_seq), 0)
    ) + 100
    INTO v_asset_item_base;

    CREATE TEMPORARY TABLE tmp_asset_item_candidates (
        asset_id BIGINT NOT NULL,
        slot_no INT NOT NULL,
        PRIMARY KEY (asset_id, slot_no)
    ) ENGINE = MEMORY;

    INSERT INTO tmp_asset_item_candidates (
        asset_id,
        slot_no
    )
    SELECT
        target_asset.asset_id,
        slots.slot_no
    FROM (
        SELECT
            MIN(actual_asset.asset_id) AS asset_id
        FROM tmp_seed_assets seed_asset
        JOIN asset actual_asset
          ON actual_asset.name = seed_asset.name
        GROUP BY seed_asset.name
    ) target_asset
    CROSS JOIN tmp_item_slots slots
    LEFT JOIN (
        SELECT
            asset_id,
            COUNT(*) AS current_item_count
        FROM asset_item
        GROUP BY asset_id
    ) item_count
      ON item_count.asset_id = target_asset.asset_id
    WHERE slots.slot_no > COALESCE(
        item_count.current_item_count,
        0
    );

    INSERT INTO asset_item (
        asset_id,
        asset_item_id,
        location,
        serial_number,
        asset_item_status
    )
    SELECT
        ranked.asset_id,
        v_asset_item_base + ranked.rn - 1,
        CASE MOD(ranked.rn - 1, 7)
            WHEN 0 THEN '본사 3층 IT자산실'
            WHEN 1 THEN '본사 4층 개발팀'
            WHEN 2 THEN '본사 5층 영업팀'
            WHEN 3 THEN '본사 6층 회의실'
            WHEN 4 THEN '본사 2층 경영지원팀'
            WHEN 5 THEN '판교 연구소'
            ELSE '부산 지사'
        END,
        CONCAT(
            'AF-DEMO-',
            LPAD(
                v_asset_item_base + ranked.rn - 1,
                8,
                '0'
            )
        ),
        'AVAILABLE'
    FROM (
        SELECT
            candidate.asset_id,
            candidate.slot_no,
            ROW_NUMBER() OVER (
                ORDER BY
                    candidate.slot_no,
                    candidate.asset_id
            ) AS rn
        FROM tmp_asset_item_candidates candidate
    ) ranked
    WHERE ranked.rn <= v_asset_item_needed
      AND NOT EXISTS (
          SELECT 1
          FROM asset_item existing_item
          WHERE existing_item.serial_number = CONCAT(
              'AF-DEMO-',
              LPAD(
                  v_asset_item_base + ranked.rn - 1,
                  8,
                  '0'
              )
          )
      );

    /*
     * 8. Hibernate 테이블 시퀀스 보정
     *
     * 직접 삽입한 PK보다 충분히 큰 값으로만 증가시킨다.
     * 기존 next_val을 절대 감소시키지 않는다.
     */
    INSERT INTO department_seq (next_val)
    SELECT COALESCE(MAX(department_id), 0) + 50
    FROM department
    WHERE NOT EXISTS (
        SELECT 1 FROM department_seq
    );

    UPDATE department_seq
    SET next_val = GREATEST(
        COALESCE(next_val, 0),
        COALESCE(
            (SELECT MAX(department_id) + 50 FROM department),
            50
        )
    );

    INSERT INTO member_seq (next_val)
    SELECT COALESCE(MAX(member_id), 0) + 50
    FROM member
    WHERE NOT EXISTS (
        SELECT 1 FROM member_seq
    );

    UPDATE member_seq
    SET next_val = GREATEST(
        COALESCE(next_val, 0),
        COALESCE(
            (SELECT MAX(member_id) + 50 FROM member),
            50
        )
    );

    INSERT INTO category_seq (next_val)
    SELECT COALESCE(MAX(category_id), 0) + 50
    FROM category
    WHERE NOT EXISTS (
        SELECT 1 FROM category_seq
    );

    UPDATE category_seq
    SET next_val = GREATEST(
        COALESCE(next_val, 0),
        COALESCE(
            (SELECT MAX(category_id) + 50 FROM category),
            50
        )
    );

    INSERT INTO asset_seq (next_val)
    SELECT COALESCE(MAX(asset_id), 0) + 50
    FROM asset
    WHERE NOT EXISTS (
        SELECT 1 FROM asset_seq
    );

    UPDATE asset_seq
    SET next_val = GREATEST(
        COALESCE(next_val, 0),
        COALESCE(
            (SELECT MAX(asset_id) + 50 FROM asset),
            50
        )
    );

    INSERT INTO asset_item_seq (next_val)
    SELECT COALESCE(MAX(asset_item_id), 0) + 50
    FROM asset_item
    WHERE NOT EXISTS (
        SELECT 1 FROM asset_item_seq
    );

    UPDATE asset_item_seq
    SET next_val = GREATEST(
        COALESCE(next_val, 0),
        COALESCE(
            (SELECT MAX(asset_item_id) + 50 FROM asset_item),
            50
        )
    );

    COMMIT;

    DROP TEMPORARY TABLE IF EXISTS tmp_asset_item_candidates;
    DROP TEMPORARY TABLE IF EXISTS tmp_item_slots;
    DROP TEMPORARY TABLE IF EXISTS tmp_seed_assets;
    DROP TEMPORARY TABLE IF EXISTS tmp_seed_categories;
    DROP TEMPORARY TABLE IF EXISTS tmp_seed_members;
    DROP TEMPORARY TABLE IF EXISTS tmp_seed_departments;

    DO RELEASE_LOCK('assetflow_portfolio_seed_small_20260826');
END$$

DELIMITER ;

CALL sp_assetflow_portfolio_seed_small_20260826();

DROP PROCEDURE IF EXISTS sp_assetflow_portfolio_seed_small_20260826;

/*
 * =========================================================
 * 실행 후 검증
 * =========================================================
 */

/*
 * 1. 전체 데이터 규모
 */
SELECT
    (SELECT COUNT(*) FROM department) AS department_count,
    (SELECT COUNT(*) FROM member) AS member_count,
    (SELECT COUNT(*) FROM category) AS category_count,
    (SELECT COUNT(*) FROM asset) AS asset_count,
    (SELECT COUNT(*) FROM asset_item) AS asset_item_count,
    (SELECT COUNT(*) FROM loan) AS loan_count,
    (SELECT COUNT(*) FROM reservation) AS reservation_count;

/*
 * 2. 회원 역할 및 상태 분포
 */
SELECT
    role,
    status,
    COUNT(*) AS member_count
FROM member
GROUP BY role, status
ORDER BY role, status;

/*
 * 3. 새 회원 계정 확인
 * 요청에 따라 portfolio.user% 대신 user%를 사용한다.
 */
SELECT
    member_id,
    login_id,
    email,
    name,
    role,
    status,
    department_id
FROM member
WHERE login_id LIKE 'user%'
ORDER BY login_id;

/*
 * 4. 기존 관리자 계정 보존 확인
 */
SELECT
    member_id,
    login_id,
    email,
    name,
    role,
    status,
    department_id
FROM member
WHERE role IN ('ADMIN', 'MANAGER')
ORDER BY role, login_id;

/*
 * 5. 부서별 회원 분포
 */
SELECT
    department.department_id,
    department.name AS department_name,
    COUNT(member.member_id) AS member_count
FROM department
LEFT JOIN member
  ON member.department_id = department.department_id
GROUP BY
    department.department_id,
    department.name
ORDER BY
    department.name;

/*
 * 6. 카테고리별 자산 및 품목 분포
 */
SELECT
    category.category_id,
    category.name AS category_name,
    COUNT(DISTINCT asset.asset_id) AS asset_count,
    COUNT(asset_item.asset_item_id) AS asset_item_count
FROM category
LEFT JOIN asset
  ON asset.category_id = category.category_id
LEFT JOIN asset_item
  ON asset_item.asset_id = asset.asset_id
GROUP BY
    category.category_id,
    category.name
ORDER BY
    category.name;

/*
 * 7. 자산별 품목 수와 이미지 경로 확인
 */
SELECT
    asset.asset_id,
    asset.name AS asset_name,
    category.name AS category_name,
    asset.image_path,
    COUNT(asset_item.asset_item_id) AS asset_item_count
FROM asset
LEFT JOIN category
  ON category.category_id = asset.category_id
LEFT JOIN asset_item
  ON asset_item.asset_id = asset.asset_id
GROUP BY
    asset.asset_id,
    asset.name,
    category.name,
    asset.image_path
ORDER BY
    asset.asset_id;

/*
 * 8. AssetItem 상태 분포
 */
SELECT
    asset_item_status,
    COUNT(*) AS item_count
FROM asset_item
GROUP BY asset_item_status
ORDER BY asset_item_status;

/*
 * 9. 생성된 시연용 시리얼번호 확인
 */
SELECT
    asset_item.asset_item_id,
    asset_item.serial_number,
    asset_item.location,
    asset_item.asset_item_status,
    asset.name AS asset_name
FROM asset_item
JOIN asset
  ON asset.asset_id = asset_item.asset_id
WHERE asset_item.serial_number LIKE 'AF-DEMO-%'
ORDER BY asset_item.asset_item_id;

/*
 * 10. login_id 중복 검증: 결과가 0행이어야 정상
 */
SELECT
    login_id,
    COUNT(*) AS duplicate_count
FROM member
GROUP BY login_id
HAVING COUNT(*) > 1;

/*
 * 11. serial_number 중복 검증: 결과가 0행이어야 정상
 */
SELECT
    serial_number,
    COUNT(*) AS duplicate_count
FROM asset_item
GROUP BY serial_number
HAVING COUNT(*) > 1;

/*
 * 12. FK 고아 데이터 검증: orphan_count가 모두 0이어야 정상
 */
SELECT
    'member.department_id' AS relation_name,
    COUNT(*) AS orphan_count
FROM member
LEFT JOIN department
  ON department.department_id = member.department_id
WHERE member.department_id IS NOT NULL
  AND department.department_id IS NULL

UNION ALL

SELECT
    'asset.category_id',
    COUNT(*)
FROM asset
LEFT JOIN category
  ON category.category_id = asset.category_id
WHERE asset.category_id IS NOT NULL
  AND category.category_id IS NULL

UNION ALL

SELECT
    'asset_item.asset_id',
    COUNT(*)
FROM asset_item
LEFT JOIN asset
  ON asset.asset_id = asset_item.asset_id
WHERE asset_item.asset_id IS NOT NULL
  AND asset.asset_id IS NULL;

/*
 * 13. PK 최대값과 Hibernate 시퀀스 값 검증
 * 각 next_val이 해당 max_id보다 커야 한다.
 */
SELECT
    'department' AS entity_name,
    COALESCE((SELECT MAX(department_id) FROM department), 0) AS max_id,
    COALESCE((SELECT MAX(next_val) FROM department_seq), 0) AS next_val

UNION ALL

SELECT
    'member',
    COALESCE((SELECT MAX(member_id) FROM member), 0),
    COALESCE((SELECT MAX(next_val) FROM member_seq), 0)

UNION ALL

SELECT
    'category',
    COALESCE((SELECT MAX(category_id) FROM category), 0),
    COALESCE((SELECT MAX(next_val) FROM category_seq), 0)

UNION ALL

SELECT
    'asset',
    COALESCE((SELECT MAX(asset_id) FROM asset), 0),
    COALESCE((SELECT MAX(next_val) FROM asset_seq), 0)

UNION ALL

SELECT
    'asset_item',
    COALESCE((SELECT MAX(asset_item_id) FROM asset_item), 0),
    COALESCE((SELECT MAX(next_val) FROM asset_item_seq), 0);

