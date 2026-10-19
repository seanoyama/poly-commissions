import "dotenv/config";
import express from "express";
import { supabase } from "./utils/supabase.js";
import cors from "cors";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const notFound = (res) =>
  res.status(404).send("Resource not found.");
const fail = (res, err) =>
  res.status(500).send(`Request failed: ${err.message}`);

app.use(express.json());

app.get("/users", async (req, res) => {
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

app.get("/users/:id", async (req, res) => {
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

app.post("/users", async (req, res) => {
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

app.patch("/users/:id", async (req, res) => {
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

app.delete("/users/:id", async (req, res) => {
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

app.get("/posts", async (req, res) => {
  try {
    let query = supabase.from("posts").select("*");
    const { data, error } = await query;
    if (error) throw error;
    res.send(data);
  } catch (err) {
    fail(res, err);
  }
});

app.get("/posts/:id", async (req, res) => {
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

app.post("/posts", async (req, res) => {
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

app.patch("/posts/:id", async (req, res) => {
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

app.delete("/posts/:id", async (req, res) => {
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

app.listen(port, () =>
  console.log(`Listening at http://localhost:${port}`)
);
