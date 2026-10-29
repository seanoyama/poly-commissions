import express from "express";
import { supabase } from "./utils/supabase.js";
import cors from "cors";

const app = express();
const port = 8000;
const CAL_POLY_EMAIL = /^[^\s@]+@calpoly\.edu$/i;

app.use(cors());
app.use(express.json());

const notFound = (res) =>
  res.status(404).send("Resource not found.");
const fail = (res, err) =>
  res.status(500).json({ error: `Request failed: ${err.message}` });
const normalizedEmail = (email) => email.trim().toLowerCase();
const isDuplicateEmailError = (error) =>
  error?.code === "email_exists" ||
  error?.status === 422 ||
  /already (been )?(registered|exists)|duplicate/i.test(error?.message ?? "");

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

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        error: "Name, email, and password are required."
      });
    }

    const normalizedUserEmail = normalizedEmail(email);

    if (!CAL_POLY_EMAIL.test(normalizedUserEmail)) {
      return res.status(400).json({
        error: "Please use your @calpoly.edu email address."
      });
    }

    const { data: created, error: authError } =
      await supabase.auth.admin.createUser({
        email: normalizedUserEmail,
        password,
        email_confirm: true
      });
    if (authError) {
      if (isDuplicateEmailError(authError)) {
        return res.status(409).json({
          error: "An account already exists for this email address."
        });
      }
      throw authError;
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        id: created.user.id,
        email: normalizedUserEmail,
        user_name,
        name: name.trim(),
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
    const user_id = req.query.user_id;    
    // getUsers(name,job).then((result) => res.send({users_list: result})).catch((err) => res.status(err).send());
    let query = supabase.from("posts").select("*");
    if(user_id){
      query = query.eq("user_id", user_id);
    }
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

app.post("/auth/login", async (req, res) => {
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

app.listen(port, () =>
  console.log(`Listening at http://localhost:${port}`)
);
