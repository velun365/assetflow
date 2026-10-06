-- Run once in an EMPTY assetflow database. Do not use mysql --force.
-- No DROP or IF NOT EXISTS: an existing schema must not be overwritten.
CREATE TABLE category (category_id BIGINT NOT NULL PRIMARY KEY, name VARCHAR(255)) ENGINE=InnoDB;
CREATE TABLE department (department_id BIGINT NOT NULL PRIMARY KEY, name VARCHAR(255)) ENGINE=InnoDB;
CREATE TABLE asset (
 asset_id BIGINT NOT NULL PRIMARY KEY, name VARCHAR(255), explanation VARCHAR(255), image_path VARCHAR(255), category_id BIGINT,
 CONSTRAINT fk_asset_category FOREIGN KEY (category_id) REFERENCES category(category_id)
) ENGINE=InnoDB;
CREATE TABLE member (
 member_id BIGINT NOT NULL PRIMARY KEY, login_id VARCHAR(255) NOT NULL UNIQUE, email VARCHAR(255), password VARCHAR(255), name VARCHAR(255),
 role ENUM('USER','MANAGER','ADMIN'), status ENUM('ACTIVE','SUSPENDED'), department_id BIGINT,
 CONSTRAINT fk_member_department FOREIGN KEY (department_id) REFERENCES department(department_id)
) ENGINE=InnoDB;
CREATE TABLE asset_item (
 asset_item_id BIGINT NOT NULL PRIMARY KEY, serial_number VARCHAR(255) NOT NULL UNIQUE, location VARCHAR(255), asset_id BIGINT,
 asset_item_status ENUM('AVAILABLE','RENTED','BROKEN','DISPOSED'),
 CONSTRAINT fk_item_asset FOREIGN KEY (asset_id) REFERENCES asset(asset_id)
) ENGINE=InnoDB;
CREATE TABLE loan (
 loan_id BIGINT NOT NULL PRIMARY KEY, member_id BIGINT, asset_item_id BIGINT,
 loan_status ENUM('RENTED','RETURN_REQUESTED','RETURNED','OVERDUE'), loan_date DATE, due_date DATE, return_date DATE,
 CONSTRAINT fk_loan_member FOREIGN KEY (member_id) REFERENCES member(member_id),
 CONSTRAINT fk_loan_item FOREIGN KEY (asset_item_id) REFERENCES asset_item(asset_item_id)
) ENGINE=InnoDB;
CREATE TABLE reservation (
 reservation_id BIGINT NOT NULL PRIMARY KEY, member_id BIGINT, asset_item_id BIGINT,
 reservation_status ENUM('WAITING','CANCELED','COMPLETED','READY'), reserved_at DATETIME(6),
 CONSTRAINT fk_reservation_member FOREIGN KEY (member_id) REFERENCES member(member_id),
 CONSTRAINT fk_reservation_item FOREIGN KEY (asset_item_id) REFERENCES asset_item(asset_item_id)
) ENGINE=InnoDB;
-- Hibernate AUTO ID generators (not AUTO_INCREMENT columns).
CREATE TABLE asset_seq (next_val BIGINT) ENGINE=InnoDB;
INSERT INTO asset_seq VALUES (1);
CREATE TABLE asset_item_seq (next_val BIGINT) ENGINE=InnoDB;
INSERT INTO asset_item_seq VALUES (1);
CREATE TABLE category_seq (next_val BIGINT) ENGINE=InnoDB;
INSERT INTO category_seq VALUES (1);
CREATE TABLE department_seq (next_val BIGINT) ENGINE=InnoDB;
INSERT INTO department_seq VALUES (1);
CREATE TABLE member_seq (next_val BIGINT) ENGINE=InnoDB;
INSERT INTO member_seq VALUES (1);
CREATE TABLE loan_seq (next_val BIGINT) ENGINE=InnoDB;
INSERT INTO loan_seq VALUES (1);
CREATE TABLE reservation_seq (next_val BIGINT) ENGINE=InnoDB;
INSERT INTO reservation_seq VALUES (1);
