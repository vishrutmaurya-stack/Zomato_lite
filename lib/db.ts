import { neon } from "@neondatabase/serverless";

// One shared connection to the Neon Postgres database.
// DATABASE_URL lives in .env.local; Next.js loads it for us.
// `sql` is a function: hand it raw SQL text (or a template),
// it runs the query and resolves with the rows. No ORM.
export const sql = neon(process.env.DATABASE_URL!);
