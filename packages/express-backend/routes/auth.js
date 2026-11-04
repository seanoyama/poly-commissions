import { supabase } from "../utils/supabase.js";
import express from "express";

const router = express.Router();

const fail = (res, err) =>
  res.status(500).json({ error: `Request failed: ${err.message}` });
const normalizedEmail = (email) => email.trim().toLowerCase();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      error: "Email and password are required."
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail(email),
      password
    });

    if (error || !data.user) {
      return res.status(401).json({
        error: "Incorrect email or password."
      });
    }

    res.status(200).json({
      user: { id: data.user.id, email: data.user.email }
    });
  } catch (err) {
    fail(res, err);
  }
});
router.get("/", async (req, res) => {
  try {
    // let query = supabase.from("auth.sessions").select("*");
    let query = supabase.auth.getSession()
    const { data, error } = await query;
    if (error) throw error;
    res.send(data);
  } catch (err) {
    fail(res, err);
  }
});

export default router;