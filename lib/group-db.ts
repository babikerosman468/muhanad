import { getSql } from "./db";

export async function getGroupSql() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS group_messages (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      message VARCHAR(2000) NOT NULL,
      approved BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE group_messages
    ADD COLUMN IF NOT EXISTS parent_id BIGINT
  `;

  await sql`
    ALTER TABLE group_messages
    ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN
    NOT NULL DEFAULT FALSE
  `;


  await sql`
    ALTER TABLE group_messages
    ADD COLUMN IF NOT EXISTS category VARCHAR(30)
    NOT NULL DEFAULT 'community'
  `;


  await sql`
    CREATE INDEX IF NOT EXISTS idx_group_messages_parent
    ON group_messages(parent_id)
  `;

  return sql;
}
