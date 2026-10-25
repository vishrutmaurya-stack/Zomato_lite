// db/setup.mjs — applies the schema and seed to the Neon database.
// Run with: npm run db:setup
//
// Plain English: this script is a robot that opens the cold-storage door,
// builds the shelves exactly as db/schema.sql says, and places the initial
// products exactly as db/seed.sql says.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("No DATABASE_URL found. Is .env.local present? (Run with: npm run db:setup)");
  process.exit(1);
}

// neon() gives us a function we call with SQL text; it runs raw SQL and
// gives the rows back. No ORM, no magic — you will see AVG(rating) here.
const sql = neon(connectionString);

const schema = readFileSync("db/schema.sql", "utf8");
const seed = readFileSync("db/seed.sql", "utf8");

// The Neon driver refuses "multiple commands into a prepared statement" —
// so we split each file into single SQL statements and send them one by one.
// (Every statement in our files ends with a ";" on its own logical line.)
function splitStatements(text) {
  return text
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.split("\n").every((line) => line.trim().startsWith("--")));
}

async function run() {
  console.log("Applying schema (2 tables)...");
  try {
    for (const statement of splitStatements(schema)) {
      await sql.query(statement);
    }
    console.log("  restaurants and reviews tables are ready.");
  } catch (err) {
    // Postgres code 42P07 = "the table already exists".
    // That is fine on a re-run: the shelves already exist, keep what is on them.
    if (err.code === "42P07") {
      console.log("  tables already exist — leaving existing data untouched.");
    } else {
      throw err;
    }
  }

  console.log("Seeding Ludhiana Burrito and 3 reviews...");
  for (const statement of splitStatements(seed)) {
    await sql.query(statement);
  }

  console.log("\nReading back what the database now contains:\n");

  const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants ORDER BY id`;
  console.log("restaurants:");
  console.table(restaurants);

  const reviews = await sql`
    SELECT id, restaurant_id, rating, comment, created_at
    FROM reviews
    ORDER BY created_at DESC
  `;
  console.log("reviews (newest first):");
  console.table(reviews);
}

run().catch((err) => {
  console.error("db:setup failed:", err.message ?? err);
  process.exit(1);
});
