import { supabase } from "../utils/supabase.js";
import express from "express";

const router = express.Router();

const notFound = (res) =>
  res.status(404).send("Resource not found.");
const fail = (res, err) =>
  res.status(500).send(`Request failed: ${err.message}`);

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*");
    if (error) throw error;
    res.send(data);
  } catch (err) {
    fail(res, err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    data ? res.send(data) : notFound(res);
  } catch (err) {
    fail(res, err);
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      email,
      password,
      user_name,
      name,
      phone,
      on_campus
    } = req.body;

    const { data: created, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
    if (authError) throw authError;

    const { data, error } = await supabase
      .from("users")
      .insert({
        id: created.user.id,
        email,
        user_name,
        name,
        phone,
        on_campus
      })
      .select()
      .single();
    if (error) {
      await supabase.auth.admin.deleteUser(created.user.id); // roll back
      throw error;
    }
    res.status(201).send(data);
  } catch (err) {
    fail(res, err);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { user_name, name, phone, on_campus } = req.body;
    const { data, error } = await supabase
      .from("users")
      .update({ user_name, name, phone, on_campus })
      .eq("id", req.params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    data ? res.send(data) : notFound(res);
  } catch (err) {
    fail(res, err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (!user) return notFound(res);

    const { error } = await supabase.auth.admin.deleteUser(
      req.params.id
    );
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    fail(res, err);
  }
});

export default router;
