import { jest } from "@jest/globals";
import express from "express";

const from = jest.fn();
const createUser = jest.fn();
const deleteUser = jest.fn();
jest.unstable_mockModule("../utils/supabase.js", () => ({
  supabase: { from, auth: { admin: { createUser, deleteUser } } }
}));
const { default: usersRouter } = await import("../routes/users.js");

const app = express();
app.use(express.json());
app.use("/users", usersRouter);
let server;
let baseUrl;

beforeAll(async () => {
  server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/users`;
});
afterAll(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});
beforeEach(() => jest.resetAllMocks());

function queryReturning(result) {
  const query = {};
  for (const name of ["select", "eq", "insert", "update"]) {
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

test("GET /users returns users", async () => {
  const users = [{ id: "1", name: "A" }, { id: "2", name: "B" }];
  const query = queryReturning({ data: users, error: null });
  const res = await request();
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(users);
  expect(from).toHaveBeenCalledWith("users");
  expect(query.select).toHaveBeenCalledWith("*");
});

test("GET /users/:id returns the requested user", async () => {
  const user = { id: "123", name: "A" };
  const query = queryReturning({ data: user, error: null });
  const res = await request("/123");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(user);
  expect(from).toHaveBeenCalledWith("users");
  expect(query.eq).toHaveBeenCalledWith("id", "123");
});

test("POST /users creates an auth account and profile without storing the password in the profile", async () => {
  const input = { email: "a@example.com", password: "secret", user_name: "alice", name: "Alice", phone: "123", on_campus: true };
  const profile = { id: "123", email: input.email, user_name: input.user_name, name: input.name, phone: input.phone, on_campus: true };
  createUser.mockResolvedValue({ data: { user: { id: "123" } }, error: null });
  const query = queryReturning({ data: profile, error: null });
  const res = await request("", jsonRequest("POST", input));
  expect(res.status).toBe(201);
  expect(await res.json()).toEqual(profile);
  expect(createUser).toHaveBeenCalledWith({ email: input.email, password: input.password, email_confirm: true });
  expect(from).toHaveBeenCalledWith("users");
  expect(query.insert).toHaveBeenCalledWith(profile);
  expect(deleteUser).not.toHaveBeenCalled();
});

test("POST /users stops if account creation fails", async () => {
  createUser.mockResolvedValue({ data: null, error: new Error("email already exists") });
  const res = await request("", jsonRequest("POST", { email: "a@example.com", password: "secret" }));
  expect(res.status).toBe(500);
  expect(await res.text()).toBe("Request failed: email already exists");
  expect(from).not.toHaveBeenCalled();
  expect(deleteUser).not.toHaveBeenCalled();
});

test("POST /users rolls back the auth account if profile creation fails", async () => {
  createUser.mockResolvedValue({ data: { user: { id: "123" } }, error: null });
  deleteUser.mockResolvedValue({ error: null });
  queryReturning({ data: null, error: new Error("profile insert failed") });
  const res = await request("", jsonRequest("POST", { email: "a@example.com", password: "secret" }));
  expect(res.status).toBe(500);
  expect(await res.text()).toBe("Request failed: profile insert failed");
  expect(deleteUser).toHaveBeenCalledWith("123");
});

test("PATCH /users/:id updates profile fields without updating credentials", async () => {
  const input = { user_name: "alice", name: "Alice", phone: "123", on_campus: false, email: "other@example.com", password: "new" };
  const fields = { user_name: "alice", name: "Alice", phone: "123", on_campus: false };
  const user = { id: "123", ...fields };
  const query = queryReturning({ data: user, error: null });
  const res = await request("/123", jsonRequest("PATCH", input));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(user);
  expect(from).toHaveBeenCalledWith("users");
  expect(query.update).toHaveBeenCalledWith(fields);
  expect(query.eq).toHaveBeenCalledWith("id", "123");
});

test("DELETE /users/:id deletes the corresponding auth account", async () => {
  const query = queryReturning({ data: { id: "123" }, error: null });
  deleteUser.mockResolvedValue({ error: null });
  const res = await request("/123", { method: "DELETE" });
  expect(res.status).toBe(204);
  expect(await res.text()).toBe("");
  expect(from).toHaveBeenCalledWith("users");
  expect(query.select).toHaveBeenCalledWith("id");
  expect(query.eq).toHaveBeenCalledWith("id", "123");
  expect(deleteUser).toHaveBeenCalledWith("123");
});

test.each(["GET", "PATCH", "DELETE"])("%s /users/:id returns 404 for a missing user", async (method) => {
  queryReturning({ data: null, error: null });
  const res = await request("/missing", method === "PATCH" ? jsonRequest(method, { name: "A" }) : { method });
  expect(res.status).toBe(404);
  expect(await res.text()).toBe("Resource not found.");
  expect(deleteUser).not.toHaveBeenCalled();
});

test.each([["GET", ""], ["GET", "/123"], ["PATCH", "/123"]])(
  "%s /users%s returns 500 on a database error", async (method, path) => {
    queryReturning({ data: null, error: new Error("database unavailable") });
    const res = await request(path, method === "PATCH" ? jsonRequest(method, { name: "A" }) : { method });
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Request failed: database unavailable");
  }
);

test("DELETE /users/:id returns 500 if auth deletion fails", async () => {
  queryReturning({ data: { id: "123" }, error: null });
  deleteUser.mockResolvedValue({ error: new Error("auth unavailable") });
  const res = await request("/123", { method: "DELETE" });
  expect(res.status).toBe(500);
  expect(await res.text()).toBe("Request failed: auth unavailable");
});

test("DELETE /users/:id returns 500 if the user lookup fails", async () => {
  queryReturning({ data: null, error: new Error("database unavailable") });
  const res = await request("/123", { method: "DELETE" });
  expect(res.status).toBe(500);
  expect(await res.text()).toBe("Request failed: database unavailable");
  expect(deleteUser).not.toHaveBeenCalled();
});
