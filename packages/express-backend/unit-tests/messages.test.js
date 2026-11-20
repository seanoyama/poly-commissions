import { jest } from "@jest/globals";
import express from "express";

const from = jest.fn();
jest.unstable_mockModule("../utils/supabase.js", () => ({ supabase: { from } }));
const { default: messagesRouter } = await import("../routes/messages.js");

const app = express();
app.use(express.json());
app.use("/messages", messagesRouter);

let server;
let baseUrl;

beforeAll(async () => {
  server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/messages`;
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

async function request(path = "", options = {}) {
  return fetch(baseUrl + path, options);
}

function jsonRequest(method, body) {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

test("GET /messages returns all messages when no chat is specified", async () => {
  const messages = [{ id: 1, chat_id: 10 }, { id: 2, chat_id: 20 }];
  const query = queryReturning({ data: messages, error: null });
  const res = await request();
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(messages);
  expect(from).toHaveBeenCalledWith("messages");
  expect(query.select).toHaveBeenCalledWith("*");
  expect(query.eq).not.toHaveBeenCalled();
});

test("GET /messages filters by chat_id", async () => {
  const messages = [{ id: 1, chat_id: 10 }];
  const query = queryReturning({ data: messages, error: null });
  const res = await request("?chat_id=10");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(messages);
  expect(query.eq).toHaveBeenCalledWith("chat_id", "10");
});

test("GET /messages/:id returns the requested message", async () => {
  const message = { id: 42, chat_id: 10, content: "Hello" };
  const query = queryReturning({ data: message, error: null });
  const res = await request("/42");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(message);
  expect(from).toHaveBeenCalledWith("messages");
  expect(query.eq).toHaveBeenCalledWith("id", "42");
  expect(query.maybeSingle).toHaveBeenCalled();
});

test("POST /messages inserts the request body and returns the created message", async () => {
  const input = { chat_id: 10, content: "Hello" };
  const created = { id: 42, ...input };
  const query = queryReturning({ data: created, error: null });
  const res = await request("", jsonRequest("POST", input));
  expect(res.status).toBe(201);
  expect(await res.json()).toEqual(created);
  expect(from).toHaveBeenCalledWith("messages");
  expect(query.insert).toHaveBeenCalledWith(input);
  expect(query.single).toHaveBeenCalled();
});

test("PATCH /messages/:id updates only the requested message", async () => {
  const changes = { content: "Edited" };
  const updated = { id: 42, chat_id: 10, ...changes };
  const query = queryReturning({ data: updated, error: null });
  const res = await request("/42", jsonRequest("PATCH", changes));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual(updated);
  expect(from).toHaveBeenCalledWith("messages");
  expect(query.update).toHaveBeenCalledWith(changes);
  expect(query.eq).toHaveBeenCalledWith("id", "42");
  expect(query.maybeSingle).toHaveBeenCalled();
});

test("DELETE /messages/:id returns 204 after deleting the requested message", async () => {
  const query = queryReturning({ data: { id: 42 }, error: null });
  const res = await request("/42", { method: "DELETE" });
  expect(res.status).toBe(204);
  expect(await res.text()).toBe("");
  expect(from).toHaveBeenCalledWith("messages");
  expect(query.delete).toHaveBeenCalled();
  expect(query.eq).toHaveBeenCalledWith("id", "42");
  expect(query.maybeSingle).toHaveBeenCalled();
});

test.each(["GET", "PATCH", "DELETE"])("%s /messages/:id returns 404 for a missing message", async (method) => {
  queryReturning({ data: null, error: null });
  const res = await request("/999", method === "PATCH" ? jsonRequest(method, { content: "Edited" }) : { method });
  expect(res.status).toBe(404);
  expect(await res.text()).toBe("Resource not found.");
});

test.each([
  ["GET", ""], ["GET", "/42"], ["POST", ""],
  ["PATCH", "/42"], ["DELETE", "/42"]
])("%s /messages%s returns 500 on a database error", async (method, path) => {
  queryReturning({ data: null, error: new Error("database unavailable") });
  const options = ["POST", "PATCH"].includes(method) ? jsonRequest(method, { content: "Hello" }) : { method };
  const res = await request(path, options);
  expect(res.status).toBe(500);
  expect(await res.text()).toBe("Request failed: database unavailable");
});
