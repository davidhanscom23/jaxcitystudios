import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { ROOMS } from "@/lib/rates";

const DEFAULT_DB = path.join(process.cwd(), "data", "jaxcity.db");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dbPath = process.env.DATABASE_PATH || DEFAULT_DB;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      hourly_room_only INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS studio_hours (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      open_time TEXT NOT NULL,
      close_time TEXT NOT NULL,
      slot_minutes INTEGER NOT NULL DEFAULT 30,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id),
      session_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('held', 'confirmed', 'cancelled')),
      client_name TEXT,
      client_email TEXT,
      client_phone TEXT,
      client_type TEXT,
      package_id TEXT,
      hours REAL,
      total_cents INTEGER,
      deposit_cents INTEGER,
      stripe_session_id TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_room_date
      ON bookings(room_id, session_date, status);
  `);

  // Migrations for payment-provider fields (safe on existing DBs)
  const cols = db
    .prepare("PRAGMA table_info(bookings)")
    .all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("payment_method")) {
    db.exec("ALTER TABLE bookings ADD COLUMN payment_method TEXT");
  }
  if (!names.has("payment_ref")) {
    db.exec("ALTER TABLE bookings ADD COLUMN payment_ref TEXT");
  }

  const roomUpsert = db.prepare(`
    INSERT INTO rooms (id, name, hourly_room_only)
    VALUES (@id, @name, @hourly)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      hourly_room_only = excluded.hourly_room_only
  `);

  const insertRooms = db.transaction(() => {
    for (const room of ROOMS) {
      roomUpsert.run({
        id: room.id,
        name: room.name,
        hourly: room.hourly,
      });
    }
  });
  insertRooms();

  const hours = db.prepare("SELECT id FROM studio_hours WHERE id = 1").get();
  if (!hours) {
    db.prepare(
      `INSERT INTO studio_hours (id, open_time, close_time, slot_minutes, notes)
       VALUES (1, '10:00', '22:00', 30, 'Sample studio hours — adjust in studio_hours table.')`,
    ).run();
  }

  seedDemoBookings(db);

  dbInstance = db;
  return db;
}

function seedDemoBookings(db: Database.Database) {
  const count = (
    db.prepare("SELECT COUNT(*) AS c FROM bookings").get() as { c: number }
  ).c;
  if (count > 0) return;

  const now = new Date();
  const isoNow = now.toISOString();
  const insert = db.prepare(`
    INSERT INTO bookings (
      id, room_id, session_date, start_time, end_time, status,
      client_name, client_email, notes, created_at, updated_at
    ) VALUES (
      @id, @room_id, @session_date, @start_time, @end_time, 'confirmed',
      @client_name, @client_email, @notes, @created_at, @updated_at
    )
  `);

  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };

  const samples = [
    {
      id: "seed-venus-afternoon",
      room_id: "venus",
      session_date: day(1),
      start_time: "14:00",
      end_time: "16:00",
      client_name: "Sample hold",
      client_email: "sample@jaxcity.local",
      notes: "Seed booking so availability UI has a blocked slot (sample).",
    },
    {
      id: "seed-mars-evening",
      room_id: "mars",
      session_date: day(1),
      start_time: "18:00",
      end_time: "21:00",
      client_name: "Sample hold",
      client_email: "sample@jaxcity.local",
      notes: "Seed booking so availability UI has a blocked slot (sample).",
    },
    {
      id: "seed-earth-morning",
      room_id: "earth",
      session_date: day(2),
      start_time: "10:00",
      end_time: "13:00",
      client_name: "Sample hold",
      client_email: "sample@jaxcity.local",
      notes: "Seed booking so availability UI has a blocked slot (sample).",
    },
    {
      id: "seed-mercury-mid",
      room_id: "mercury",
      session_date: day(2),
      start_time: "12:00",
      end_time: "14:00",
      client_name: "Sample hold",
      client_email: "sample@jaxcity.local",
      notes: "Seed booking so availability UI has a blocked slot (sample).",
    },
  ];

  const tx = db.transaction(() => {
    for (const row of samples) {
      insert.run({ ...row, created_at: isoNow, updated_at: isoNow });
    }
  });
  tx();
}
