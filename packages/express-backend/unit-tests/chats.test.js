import { jest } from "@jest/globals";

const from = jest.fn();
jest.unstable_mockModule("../utils/supabase.js", () => ({
  supabase: { from }
}));
const { default: router } = await import("../routes/chats.js");

function handler(method, path) {
  return router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method])
    .route.stack.find((layer) => layer.method === method).handle;
}

function response() {
  return { status: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() };
}

function mockQuery(result) {
  const query = {};
  for (const method of ["select", "or", "eq", "insert", "update", "delete"]) {
    query[method] = jest.fn().mockReturnValue(query);
  }
  query.maybeSingle = jest.fn().mockResolvedValue(result);
  query.single = jest.fn().mockResolvedValue(result);
  query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  from.mockReturnValue(query);
  return query;
}

beforeEach(() => jest.resetAllMocks());

describe("GET /", () => {
  test("returns all chats", async () => {
    const chats = [{ id: 1 }];
    const query = mockQuery({ data: chats, error: null });
    const res = response();
    await handler("get", "/")({ query: {} }, res);
    expect(from).toHaveBeenCalledWith("chats");
    expect(query.select).toHaveBeenCalledWith("*");
    expect(query.or).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(chats);
  });

  test("filters chats by either participant", async () => {
    const query = mockQuery({ data: [], error: null });
    await handler("get", "/")({ query: { user: "user-1" } }, response());
    expect(query.or).toHaveBeenCalledWith("user_one.eq.user-1,user_two.eq.user-1");
  });
});

describe("GET /:id", () => {
  test("returns the matching chat", async () => {
    const chat = { id: "1" };
    const query = mockQuery({ data: chat, error: null });
    const res = response();
    await handler("get", "/:id")({ params: { id: "1" } }, res);
    expect(query.eq).toHaveBeenCalledWith("id", "1");
    expect(res.send).toHaveBeenCalledWith(chat);
  });
});

test("POST / creates a chat", async () => {
  const chat = { user_one: "1", user_two: "2" };
  const query = mockQuery({ data: { id: 1, ...chat }, error: null });
  const res = response();
  await handler("post", "/")({ body: chat }, res);
  expect(query.insert).toHaveBeenCalledWith(chat);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith({ id: 1, ...chat });
});

test("PATCH /:id updates a chat", async () => {
  const changes = { user_two: "3" };
  const query = mockQuery({ data: { id: "1", ...changes }, error: null });
  const res = response();
  await handler("patch", "/:id")({ params: { id: "1" }, body: changes }, res);
  expect(query.update).toHaveBeenCalledWith(changes);
  expect(query.eq).toHaveBeenCalledWith("id", "1");
  expect(res.send).toHaveBeenCalledWith({ id: "1", ...changes });
});

test("DELETE /:id deletes a chat", async () => {
  const query = mockQuery({ data: { id: "1" }, error: null });
  const res = response();
  await handler("delete", "/:id")({ params: { id: "1" } }, res);
  expect(query.delete).toHaveBeenCalled();
  expect(query.eq).toHaveBeenCalledWith("id", "1");
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalledWith();
});

test.each(["get", "patch", "delete"])("%s /:id returns 404 when the chat is missing", async (method) => {
  mockQuery({ data: null, error: null });
  const res = response();
  await handler(method, "/:id")({ params: { id: "missing" }, body: {} }, res);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.send).toHaveBeenCalledWith("Resource not found.");
});

test.each([
  ["get", "/"], ["get", "/:id"], ["post", "/"],
  ["patch", "/:id"], ["delete", "/:id"]
])("%s %s returns 500 on a Supabase error", async (method, path) => {
  mockQuery({ data: null, error: new Error("unavailable") });
  const res = response();
  await handler(method, path)({ query: {}, params: { id: "1" }, body: {} }, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith("Request failed: unavailable");
});
