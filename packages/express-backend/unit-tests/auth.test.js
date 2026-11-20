import { jest } from "@jest/globals";

const auth = {
  signInWithPassword: jest.fn(),
  getSession: jest.fn(),
  getUser: jest.fn()
};

// jest can mock supabase (supacool)
jest.unstable_mockModule("../utils/supabase.js", () => ({
  supabase: { auth }
}));

const { default: router } = await import("../routes/auth.js");

function handler(method, path) {
  return router.stack.find((layer) => layer.route?.path === path)
    .route.stack.find((layer) => layer.method === method).handle;
}

function response() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  };
}

beforeEach(() => jest.resetAllMocks());

describe("POST /login", () => {
  const login = handler("post", "/login");

  test.each([
    {},
    { email: " ", password: "password" },
    { email: "user@example.com", password: "" }
  ])("rejects missing credentials: %o", async (body) => {
    const res = response();
    await login({ body }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email and password are required." });
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  test("normalizes the email and returns the signed-in user", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "123", email: "user@calpoly.edu", extra: "hidden" } },
      error: null
    });
    const res = response();
    await login({ body: { email: " User@CalPoly.edu ", password: "password" } }, res);
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "user@calpoly.edu", password: "password" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: { id: "123", email: "user@calpoly.edu" } });
  });

  test.each([
    { data: { user: null }, error: null },
    { data: { user: null }, error: new Error("invalid credentials") }
  ])("rejects unsuccessful sign-in", async (result) => {
    auth.signInWithPassword.mockResolvedValue(result);
    const res = response();
    await login({ body: { email: "user@calpoly.edu", password: "wrong" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Incorrect email or password." });
  });

  test("returns 500 when sign-in throws", async () => {
    auth.signInWithPassword.mockRejectedValue(new Error("unavailable"));
    const res = response();
    await login({ body: { email: "user@calpoly.edu", password: "password" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Request failed: unavailable" });
  });
});

describe.each([
  ["/", "getSession"],
  ["/user", "getUser"]
])("GET %s", (path, method) => {
  test("returns Supabase data", async () => {
    const data = { value: "example" };
    auth[method].mockResolvedValue({ data, error: null });
    const res = response();
    await handler("get", path)({}, res);
    expect(res.send).toHaveBeenCalledWith(data);
  });

  test("returns 500 for a Supabase error", async () => {
    auth[method].mockResolvedValue({ data: null, error: new Error("unavailable") });
    const res = response();
    await handler("get", path)({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Request failed: unavailable" });
  });
});
