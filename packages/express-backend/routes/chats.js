import { supabase } from "../utils/supabase.js";
import express from "express";

const router = express.Router();

const notFound = (res) =>
  res.status(404).send("Resource not found.");
const fail = (res, err) =>
  res.status(500).send(`Request failed: ${err.message}`);

router.get("/", async (req, res) => {
  try {
    let query = supabase.from("chats").select("*");
    if(req.query.user){
      // checks if user is either user_one or user_two of the chats
      query = query.or(`user_one.eq.${req.query.user},user_two.eq.${req.query.user}`);
    }
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
      .from("chats")
      .select("*")
      // .or('req.params.id.eq."user_one",req.params.id.eq."user_two"')
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
      .from("chats")
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
      .from("chats")
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
      .from("chats")
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
