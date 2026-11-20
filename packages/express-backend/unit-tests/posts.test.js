import { jest } from "@jest/globals";
import express from "express";

const from = jest.fn();
jest.unstable_mockModule("../utils/supabase.js", () => ({ supabase: { from } }));
const { default: postsRouter } = await import("../routes/posts.js");

const app = express();
app.use(express.json());
app.use("/posts", postsRouter);

let server;
let baseUrl;

beforeAll(async () => {
  server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/posts`;
});

afterAll(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

beforeEach(() => from.mockReset());

function queryReturning(result) {
  const query = {};
  for (const name of ["select", "eq", "insert", "update", "delete"]) {
    query[name] = jest.fn().mockReturnValue(query);
  }
  query.single = jest.fn().mockResolvedValue(result);
  query.maybeSingle = jest.fn().mockResolvedValue(result);
  query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  from.mockReturnValue(query);
  return query;
}

function request(path = "", options = {}) {
  return fetch(baseUrl + path, options);
}

function jsonRequest(method, body) {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

test("GET /posts returns all posts when no user is specified", async () => {
  const posts = [{ id: 1, user_id: 10 }, { id: 2, user_id: 20 }];
  const query = queryReturning({ data: posts, error: null });
  const res = await request();
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(posts);
  expect(from).toHaveBeenCalledWith("posts");
  expect(query.select).toHaveBeenCalledWith("*");
  expect(query.eq).not.toHaveBeenCalled();
});

test("GET /posts filters by user_id", async () => {
  const posts = [{ id: 1, user_id: 10 }];
  const query = queryReturning({ data: posts, error: null });
  const res = await request("?user_id=10");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(posts);
  expect(from).toHaveBeenCalledWith("posts");
  expect(query.eq).toHaveBeenCalledWith("user_id", "10");
});

test("GET /posts/:id returns the requested post", async () => {
  const post = { id: 42, user_id: 10, title: "Example" };
  const query = queryReturning({ data: post, error: null });
  const res = await request("/42");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(post);
  expect(from).toHaveBeenCalledWith("posts");
  expect(query.select).toHaveBeenCalledWith("*");
  expect(query.eq).toHaveBeenCalledWith("id", "42");
  expect(query.maybeSingle).toHaveBeenCalled();
});

test("POST /posts inserts the request body and returns the created post", async () => {
  const input = { user_id: 10, title: "Example" };
  const created = { id: 42, ...input };
  const query = queryReturning({ data: created, error: null });
  const res = await request("", jsonRequest("POST", input));
  expect(res.status).toBe(201);
  expect(await res.json()).toEqual(created);
  expect(from).toHaveBeenCalledWith("posts");
  expect(query.insert).toHaveBeenCalledWith(input);
  expect(query.select).toHaveBeenCalledWith();
  expect(query.single).toHaveBeenCalled();
});

test("PATCH /posts/:id updates the requested post", async () => {
  const changes = { title: "Edited" };
  const updated = { id: 42, user_id: 10, ...changes };
  const query = queryReturning({ data: updated, error: null });
  const res = await request("/42", jsonRequest("PATCH", changes));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(updated);
  expect(from).toHaveBeenCalledWith("posts");
  expect(query.update).toHaveBeenCalledWith(changes);
  expect(query.eq).toHaveBeenCalledWith("id", "42");
  expect(query.select).toHaveBeenCalledWith();
  expect(query.maybeSingle).toHaveBeenCalled();
});

test("DELETE /posts/:id returns 204 after deleting the requested post", async () => {
  const query = queryReturning({ data: { id: 42 }, error: null });
  const res = await request("/42", { method: "DELETE" });
  expect(res.status).toBe(204);
  expect(await res.text()).toBe("");
  expect(from).toHaveBeenCalledWith("posts");
  expect(query.delete).toHaveBeenCalled();
  expect(query.eq).toHaveBeenCalledWith("id", "42");
  expect(query.select).toHaveBeenCalledWith();
  expect(query.maybeSingle).toHaveBeenCalled();
});

test.each(["GET", "PATCH", "DELETE"])("%s /posts/:id returns 404 for a missing post", async (method) => {
  const query = queryReturning({ data: null, error: null });
  const res = await request("/999", method === "PATCH" ? jsonRequest(method, { title: "Edited" }) : { method });
  expect(res.status).toBe(404);
  expect(await res.text()).toBe("Resource not found.");
  expect(query.eq).toHaveBeenCalledWith("id", "999");
});

test.each([
  ["GET", ""], ["GET", "/42"], ["POST", ""],
  ["PATCH", "/42"], ["DELETE", "/42"]
])("%s /posts%s returns 500 on a database error", async (method, path) => {
  queryReturning({ data: null, error: new Error("database unavailable") });
  const options = ["POST", "PATCH"].includes(method) ? jsonRequest(method, { title: "Example" }) : { method };
  const res = await request(path, options);
  expect(res.status).toBe(500);
  expect(await res.text()).toBe("Request failed: database unavailable");
});
