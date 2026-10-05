const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

const sql = neon(process.env.DATABASE_URL);

module.exports = sql;