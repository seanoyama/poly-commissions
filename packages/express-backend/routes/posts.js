import { supabase } from "../utils/supabase.js";
import express from "express";

const router = express.Router();

const notFound = (res) =>
  res.status(404).send("Resource not found.");
const fail = (res, err) =>
  res.status(500).send(`Request failed: ${err.message}`);

router.get("/", async (req, res) => {
  try {
    let query = supabase.from("posts").select("*");
    const { data, error } = await query;
    if (error) throw error;
    res.send(data);
  } catch (err) {
    fail(res, err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("posts")
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
    const { data, error } = await supabase
      .from("posts")
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).send(data);
  } catch (err) {
    fail(res, err);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .update(req.body)
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
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", req.params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    data ? res.status(204).send() : notFound(res);
  } catch (err) {
    fail(res, err);
  }
});

export default router;
