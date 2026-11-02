// import { createClient } from "@supabase/supabase-js";

<<<<<<< HEAD:packages/express-backend/supabase.js
// // Retrieve environment variables depending on your framework
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// // Initialize the single Supabase client instance
// export const supabase = createClient(
//   supabaseUrl,
//   supabaseAnonKey
// );
=======
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
>>>>>>> 4407bf77dab9271cacd6a41363dd67e15f81407d:packages/react-frontend/src/supabase.ts
