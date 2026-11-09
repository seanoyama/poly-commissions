TE6: Authentication

We authenticate users by requiring a calpoly.edu domain and using Supabase Auth.
* Users sign up and log in through SignupForm.tsx and LoginForm.tsx in our react-frontend
* LoginForm.tsx posts the user to our auth.js route in the express-backend
* auth.js checks credentials using Supabase Auth and signInWithPassword()
* supabase.js in the express-backend creates a client that auth.js then uses to create a token and time-limited session
