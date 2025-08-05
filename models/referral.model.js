const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getReferralDetails(userId, maxLevels = 5) {
  const result = await pool.query(
    `
    WITH RECURSIVE referral_chain AS (
      SELECT u.id, u.name, u.apellidos, u.username, u.email, u.sponsor_id, u.created_at, 0 AS level
      FROM users u
      WHERE u.id = $1
      UNION ALL
      SELECT u.id, u.name, u.apellidos, u.username, u.email, u.sponsor_id, u.created_at, rc.level + 1
      FROM users u
      INNER JOIN referral_chain rc ON u.sponsor_id = rc.id
      WHERE rc.level < $2
    )
    SELECT 
      rc.id AS usuario_id,
      rc.name,
      rc.apellidos,
      rc.username,
      rc.email,
      rc.sponsor_id,
      rc.created_at,
      rc.level,
      (
        SELECT COUNT(*) FROM users s WHERE s.sponsor_id = rc.id
      ) AS numero_directos,
      (
        SELECT COUNT(*) FROM users s2
        WHERE s2.id IN (
          SELECT id FROM (
            WITH RECURSIVE sub AS (
              SELECT id FROM users WHERE sponsor_id = rc.id
              UNION ALL
              SELECT users.id FROM users INNER JOIN sub ON users.sponsor_id = sub.id
            )
            SELECT id FROM sub
          ) x
        )
      ) AS numero_subordinados
    FROM referral_chain rc
    ORDER BY rc.level ASC;
    `,
    [userId, maxLevels]
  );
  return result.rows;
}

module.exports = { getReferralDetails };
