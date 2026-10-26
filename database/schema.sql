CREATE DATABASE IF NOT EXISTS campuscare
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campuscare;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','admin','technician') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buildings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE rooms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  building_id BIGINT UNSIGNED NOT NULL,
  room_number VARCHAR(30) NOT NULL,
  floor VARCHAR(30),
  UNIQUE KEY uq_building_room (building_id, room_number),
  CONSTRAINT fk_rooms_building FOREIGN KEY (building_id) REFERENCES buildings(id)
);

CREATE TABLE categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE maintenance_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  building_id BIGINT UNSIGNED NOT NULL,
  room_id BIGINT UNSIGNED NULL,
  location_detail VARCHAR(160),
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  status ENUM('submitted','assigned','in_progress','resolved','cancelled') NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  CONSTRAINT fk_request_student FOREIGN KEY (student_id) REFERENCES users(id),
  CONSTRAINT fk_request_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_request_building FOREIGN KEY (building_id) REFERENCES buildings(id),
  CONSTRAINT fk_request_room FOREIGN KEY (room_id) REFERENCES rooms(id),
  INDEX idx_request_status_priority (status, priority),
  INDEX idx_request_created (created_at)
);

CREATE TABLE request_photos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  storage_key VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_photo_request FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE
);

CREATE TABLE assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NOT NULL,
  assigned_by BIGINT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unassigned_at TIMESTAMP NULL,
  CONSTRAINT fk_assignment_request FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_technician FOREIGN KEY (technician_id) REFERENCES users(id),
  CONSTRAINT fk_assignment_admin FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE TABLE request_comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_request FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  changed_by BIGINT UNSIGNED NOT NULL,
  old_status ENUM('submitted','assigned','in_progress','resolved','cancelled') NULL,
  new_status ENUM('submitted','assigned','in_progress','resolved','cancelled') NOT NULL,
  note VARCHAR(500),
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users(id),
  INDEX idx_history_request_time (request_id, changed_at)
);

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  request_id BIGINT UNSIGNED NULL,
  title VARCHAR(160) NOT NULL,
  body VARCHAR(500) NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_request FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  INDEX idx_notification_unread (user_id, read_at)
);

-- Admin-friendly complaint register showing who raised each request.
CREATE OR REPLACE VIEW complaint_register AS
SELECT
  mr.id AS request_id,
  mr.title,
  mr.description,
  mr.priority,
  mr.status,
  student.id AS student_id,
  student.name AS student_name,
  student.email AS student_email,
  c.name AS category,
  b.name AS building,
  COALESCE(r.room_number, mr.location_detail) AS room_or_location,
  technician.name AS assigned_technician,
  mr.created_at,
  mr.updated_at,
  mr.resolved_at
FROM maintenance_requests mr
JOIN users student ON student.id = mr.student_id
JOIN categories c ON c.id = mr.category_id
JOIN buildings b ON b.id = mr.building_id
LEFT JOIN rooms r ON r.id = mr.room_id
LEFT JOIN assignments a
  ON a.request_id = mr.id AND a.unassigned_at IS NULL
LEFT JOIN users technician ON technician.id = a.technician_id;
