/**
 * Seed script — populates the database with demo data.
 * Run: cd server && npm run seed
 *
 * ⚠️  This script truncates all tables before inserting fresh data.
 *     Use only in development!
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool, execute } from "./db.js";
async function seed() {
  console.log("🌱 Seeding CampusCare database…\n");
  // ── Clear existing data (FK-safe order) ───────────────────────────────────
  await execute("SET FOREIGN_KEY_CHECKS = 0");
  for (const t of [
    "status_history", "request_comments", "request_photos",
    "assignments", "notifications", "maintenance_requests",
    "rooms", "buildings", "categories", "users",
  ]) {
    await execute(`TRUNCATE TABLE ${t}`);
  }
  await execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("✅  Tables cleared");
  // ── Users ──────────────────────────────────────────────────────────────────
  const hash = (pw: string) => bcrypt.hash(pw, 12);
  const [studentHash, adminHash, techHash1, techHash2] = await Promise.all([
    hash("student123"),
    hash("admin123"),
    hash("tech123"),
    hash("tech123"),
  ]);
  await execute(
    `INSERT INTO users (name, email, password_hash, role) VALUES
      ('Alex Morgan',  'student@campus.edu', ?, 'student'),
      ('Jamie Chen',   'jamie@campus.edu',   ?, 'student'),
      ('Sam Davis',    'admin@campus.edu',   ?, 'admin'),
      ('Marcus Lee',   'marcus@campus.edu',  ?, 'technician'),
      ('Jordan Kim',   'jordan@campus.edu',  ?, 'technician')`,
    [studentHash, studentHash, adminHash, techHash1, techHash2]
  );
  console.log("✅  Users seeded (student / admin / 2 technicians)");
  // ── Buildings ──────────────────────────────────────────────────────────────
  await execute(
    `INSERT INTO buildings (name, code) VALUES
      ('Maple Hall',    'MH'),
      ('Science Center','SC'),
      ('Oak Library',   'OL'),
      ('Student Union', 'SU')`
  );
  console.log("✅  Buildings seeded");
  // ── Rooms ──────────────────────────────────────────────────────────────────
  await execute(
    `INSERT INTO rooms (building_id, room_number, floor) VALUES
      (1, '118',      '1st'),
      (1, '204',      '2nd'),
      (2, '2nd floor','2nd'),
      (3, 'Study 3',  '1st')`
  );
  console.log("✅  Rooms seeded");
  // ── Categories ─────────────────────────────────────────────────────────────
  await execute(
    `INSERT INTO categories (name) VALUES
      ('HVAC'), ('Electrical'), ('Plumbing'), ('Furniture'), ('Cleaning')`
  );
  console.log("✅  Categories seeded");
  // ── Maintenance Requests ───────────────────────────────────────────────────
  await execute(
    `INSERT INTO maintenance_requests
       (id, student_id, category_id, building_id, room_id, title, description, priority, status, created_at)
     VALUES
       (1048, 1, 1, 1, 2, 'Air conditioner leaking',
        'Water is dripping from the AC unit near the window.',
        'high', 'in_progress', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
       (1047, 2, 2, 2, 3, 'Hallway light flickering',
        'The light outside lab 212 flickers continuously.',
        'medium', 'assigned', DATE_SUB(NOW(), INTERVAL 1 DAY)),
       (1046, 2, 3, 1, 1, 'Sink drain blocked',
        'The shared bathroom sink is completely blocked.',
        'urgent', 'submitted', DATE_SUB(NOW(), INTERVAL 5 DAY)),
       (1045, 1, 4, 3, 4, 'Desk leg is loose',
        'The front right desk leg is unstable.',
        'low', 'resolved', DATE_SUB(NOW(), INTERVAL 8 DAY))`
  );
  console.log("✅  Maintenance requests seeded");
  // ── Assignments ────────────────────────────────────────────────────────────
  await execute(
    `INSERT INTO assignments (request_id, technician_id, assigned_by) VALUES
      (1048, 4, 3),
      (1047, 5, 3),
      (1045, 4, 3)`
  );
  console.log("✅  Assignments seeded");
  // ── Comments ───────────────────────────────────────────────────────────────
  await execute(
    `INSERT INTO request_comments (request_id, author_id, body, created_at) VALUES
      (1048, 4, 'Replacement valve ordered. I will return this afternoon.', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
      (1045, 4, 'Desk has been repaired and stabilised.', DATE_SUB(NOW(), INTERVAL 7 DAY))`
  );
  console.log("✅  Comments seeded");
  // ── Status History ─────────────────────────────────────────────────────────
  await execute(
    `INSERT INTO status_history (request_id, changed_by, old_status, new_status) VALUES
      (1048, 3, 'submitted', 'assigned'),
      (1048, 3, 'assigned',  'in_progress'),
      (1047, 3, 'submitted', 'assigned'),
      (1045, 3, 'submitted', 'assigned'),
      (1045, 3, 'assigned',  'resolved')`
  );
  console.log("✅  Status history seeded");
  // ── Notifications ──────────────────────────────────────────────────────────
  await execute(
    `INSERT INTO notifications (user_id, request_id, title, body) VALUES
      (1, 1048, 'Technician assigned', 'Marcus Lee has been assigned to your AC repair request.'),
      (1, 1048, 'Request status updated', 'Your request is now in progress.'),
      (1, 1045, 'Request resolved', 'Your desk repair request has been resolved!'),
      (2, 1047, 'Technician assigned', 'Jordan Kim has been assigned to your electrical request.')`
  );
  console.log("✅  Notifications seeded");
  await pool.end();
  console.log("\n🎉 Seed complete! Demo credentials:");
  console.log("   Student:    student@campus.edu / student123");
  console.log("   Admin:      admin@campus.edu   / admin123");
  console.log("   Technician: marcus@campus.edu  / tech123\n");
}
seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
