import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

<<<<<<< HEAD
export const supabase = createClient(supabaseUrl, supabaseKey);
=======
const supabaseUrl =
  process.env.SUPABASE_URL ??
  process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for the backend."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
>>>>>>> 4407bf77dab9271cacd6a41363dd67e15f81407d
