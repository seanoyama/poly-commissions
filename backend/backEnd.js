import express from "express";
import { createClient } from "@supabase/supabase-js";
import SUPABASE_URI from ".env";
//import user from user schema

const app = express();
const port = 8000;

const supabaseUrl = "https://supabase.co";
const supabaseKey = SUPABASE_URI;

export const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    //grab users
    const { data, error } = await supabase
      .from("Users")
      .select("*");
    res.send(users);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const id = req.query.id;
    const { data, error } = await supabase
      .from("Users")
      .select("id");
    res.send(users);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});

app.delete("/users", async (req, res) => {
  try {
    //grab id
    //delete by id
    res.send(users);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});

app.post("/users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Users")
      .insert([
        { userName: req.params.userName, id: req.params.id }
      ])
      .select();
    res.send(user);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});

app.patch("/users", async (req, res) => {
  try {
    //patch
    res.send(users);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});

app.get("/posts", async (req, res) => {
  try {
    //grab posts
    res.send(users);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});

app.get("/posts/:id", async (req, res) => {
  try {
    const id = req.query.id;
    //grab post with id
    res.send(users);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});

app.delete("/posts", async (req, res) => {
  try {
    //grab id
    //delete by id
    res.send(users);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});

app.post("/posts", async (req, res) => {
  try {
    //post object
    res.send(user);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});

app.patch("/posts", async (req, res) => {
  try {
    //patch
    res.send(users);
  } catch (err) {
    res.status(404).send(`Failed to find: ${err}`);
  }
});
