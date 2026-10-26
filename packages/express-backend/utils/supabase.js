import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(currentDirectory, "..", ".env") });

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for the backend."
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
