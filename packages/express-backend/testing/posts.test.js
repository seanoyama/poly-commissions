import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import postRouter from "../routes/posts.js";
import { supabase } from "../utils/supabase.js";

vi.mock("../utils/supabase.js", () => ({
  supabase: {
    from: vi.fn()
  }
}));

const app = express();
app.use(express.json());
app.use("/posts", postRouter);

const createSupabaseMock = (resolvedValue) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolvedValue),
    maybeSingle: vi.fn().mockResolvedValue(resolvedValue),
    then: (resolve) => resolve(resolvedValue)
  };
  supabase.from.mockReturnValue(chain);
  return chain;
};

describe("Posts System Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /posts", () => {
    it("returns all posts", async () => {
      const mockPosts = [
        { id: 1, title: "abc" },
        { id: 2, title: "123" }
      ];
      const chain = createSupabaseMock({
        data: mockPosts,
        error: null
      });

      const res = await request(app).get("/posts");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPosts);
      expect(supabase.from).toHaveBeenCalledWith("posts");
      expect(chain.select).toHaveBeenCalledWith("*");
      expect(chain.eq).not.toHaveBeenCalled();
    });

    it("filters messages when chat_id query is provided", async () => {
      const mockPosts = [
        { id: 1, user_id: "123", title: "User Post" }
      ];
      const chain = createSupabaseMock({
        data: mockPosts,
        error: null
      });

      const res = await request(app).get("/posts?user_id=123");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPosts);
      expect(chain.eq).toHaveBeenCalledWith("user_id", "123");
    });

    it("returns 500 if Supabase throws an error", async () => {
      createSupabaseMock({
        data: null,
        error: { message: "DB Connection Failed" }
      });

      const res = await request(app).get("/posts");

      expect(res.status).toBe(500);
      expect(res.text).toBe(
        "Request failed: DB Connection Failed"
      );
    });
  });

  describe("GET /posts/:id", () => {
    it("returns a single post from valid id", async () => {
      const mockPost = { id: 1, title: "Single Post" };
      const chain = createSupabaseMock({
        data: mockPost,
        error: null
      });

      const res = await request(app).get("/posts/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPost);
      expect(chain.eq).toHaveBeenCalledWith("id", "1");
      expect(chain.maybeSingle).toHaveBeenCalled();
    });

    it("returns 404 for missing post", async () => {
      createSupabaseMock({ data: null, error: null });

      const res = await request(app).get("/posts/999");

      expect(res.status).toBe(404);
      expect(res.text).toBe("Resource not found.");
    });

    it("returns 500 on database error", async () => {
      createSupabaseMock({
        data: null,
        error: { message: "Invalid UUID" }
      });

      const res = await request(app).get("/posts/bad-id");

      expect(res.status).toBe(500);
      expect(res.text).toBe("Request failed: Invalid UUID");
    });
  });

  describe("POST /posts", () => {
    it("returns 201 when creating a post", async () => {
      const payload = { title: "New Post", user_id: "123" };
      const createdPost = { id: 1, ...payload };
      const chain = createSupabaseMock({
        data: createdPost,
        error: null
      });

      const res = await request(app)
        .post("/posts")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(createdPost);
      expect(chain.insert).toHaveBeenCalledWith(payload);
      expect(chain.single).toHaveBeenCalled();
    });

    it("returns 500 if insert fails", async () => {
      createSupabaseMock({
        data: null,
        error: { message: "Null constraint violation" }
      });

      const res = await request(app).post("/posts").send({});

      expect(res.status).toBe(500);
      expect(res.text).toBe(
        "Request failed: Null constraint violation"
      );
    });
  });

  describe("PATCH /posts/:id", () => {
    it("updates a post and returns 200", async () => {
      const updates = { title: "Updated Title" };
      const updatedPost = { id: 1, title: "Updated Title" };
      const chain = createSupabaseMock({
        data: updatedPost,
        error: null
      });

      const res = await request(app)
        .patch("/posts/1")
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedPost);
      expect(chain.update).toHaveBeenCalledWith(updates);
      expect(chain.eq).toHaveBeenCalledWith("id", "1");
    });

    it("returns 404 if post to update does not exist", async () => {
      createSupabaseMock({ data: null, error: null });

      const res = await request(app)
        .patch("/posts/999")
        .send({ title: "Ghost" });

      expect(res.status).toBe(404);
      expect(res.text).toBe("Resource not found.");
    });

    it("returns 500 if update fails", async () => {
      createSupabaseMock({
        data: null,
        error: { message: "Update failed" }
      });

      const res = await request(app)
        .patch("/posts/1")
        .send({ title: "Fail" });

      expect(res.status).toBe(500);
      expect(res.text).toBe("Request failed: Update failed");
    });
  });

  describe("DELETE /posts/:id", () => {
    it("deletes the post and return 204", async () => {
      const deletedPost = { id: 1, title: "Deleted" };
      const chain = createSupabaseMock({
        data: deletedPost,
        error: null
      });

      const res = await request(app).delete("/posts/1");

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith("id", "1");
    });

    it("returns 404 if post to delete does not exist", async () => {
      createSupabaseMock({ data: null, error: null });

      const res = await request(app).delete("/posts/999");

      expect(res.status).toBe(404);
      expect(res.text).toBe("Resource not found.");
    });

    it("returns 500 if delete fails", async () => {
      createSupabaseMock({
        data: null,
        error: { message: "Foreign key constraint" }
      });

      const res = await request(app).delete("/posts/1");

      expect(res.status).toBe(500);
      expect(res.text).toBe(
        "Request failed: Foreign key constraint"
      );
    });
  });
});
