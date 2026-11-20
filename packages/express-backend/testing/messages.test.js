import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import messagesRouter from "../routes/messages.js";
import { supabase } from "../utils/supabase.js";

vi.mock("../utils/supabase.js", () => ({
  supabase: {
    from: vi.fn()
  }
}));

const app = express();
app.use(express.json());
app.use("/messages", messagesRouter);

const createSupabaseMock = (resolvedValue) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(resolvedValue),
    single: vi.fn().mockResolvedValue(resolvedValue),
    then: (resolve) => resolve(resolvedValue)
  };
  return chain;
};

describe("Messages System Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /messages", () => {
    it("returns all messages", async () => {
      const mockMessages = [
        { id: 1, text: "abc" },
        { id: 2, text: "123" }
      ];
      const mockChain = createSupabaseMock({
        data: mockMessages,
        error: null
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app).get("/messages");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMessages);
      expect(supabase.from).toHaveBeenCalledWith("messages");
      expect(mockChain.select).toHaveBeenCalledWith("*");
      expect(mockChain.eq).not.toHaveBeenCalled();
    });

    it("filters messages when chat_id query is provided", async () => {
      const mockMessages = [
        { id: 1, chat_id: "chat-123", text: "Filtered" }
      ];
      const mockChain = createSupabaseMock({
        data: mockMessages,
        error: null
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app).get(
        "/messages?chat_id=chat-123"
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMessages);
      expect(mockChain.eq).toHaveBeenCalledWith(
        "chat_id",
        "chat-123"
      );
    });

    it("returns 500 if Supabase throws an error", async () => {
      const mockChain = createSupabaseMock({
        data: null,
        error: new Error("DB failure")
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app).get("/messages");

      expect(res.status).toBe(500);
      expect(res.text).toBe("Request failed: DB failure");
    });
  });

  describe("GET /messages/:id", () => {
    it("returns a single message from valid id", async () => {
      const mockMessage = { id: "1", text: "Single message" };
      const mockChain = createSupabaseMock({
        data: mockMessage,
        error: null
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app).get("/messages/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMessage);
      expect(mockChain.eq).toHaveBeenCalledWith("id", "1");
      expect(mockChain.maybeSingle).toHaveBeenCalled();
    });

    it("returns 404 for missing message", async () => {
      const mockChain = createSupabaseMock({
        data: null,
        error: null
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app).get("/messages/999");

      expect(res.status).toBe(404);
      expect(res.text).toBe("Resource not found.");
    });

    it("returns 500 on database error", async () => {
      const mockChain = createSupabaseMock({
        data: null,
        error: new Error("Query failed")
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app).get("/messages/1");

      expect(res.status).toBe(500);
      expect(res.text).toBe("Request failed: Query failed");
    });
  });

  describe("POST /messages", () => {
    it("returns 201 when creating a message", async () => {
      const message = {
        chat_id: "chat1",
        text: "abc123"
      };
      const createdMessage = { id: "10", ...message };
      const mockChain = createSupabaseMock({
        data: createdMessage,
        error: null
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app)
        .post("/messages")
        .send(message);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(createdMessage);
      expect(mockChain.insert).toHaveBeenCalledWith(message);
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.single).toHaveBeenCalled();
    });

    it("returns 500 if insert fails", async () => {
      const mockChain = createSupabaseMock({
        data: null,
        error: new Error("Insert constraint error")
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app)
        .post("/messages")
        .send({ text: "Bad data" });

      expect(res.status).toBe(500);
      expect(res.text).toBe(
        "Request failed: Insert constraint error"
      );
    });
  });

  describe("PATCH /messages/:id", () => {
    it("updates a message and returns 200", async () => {
      const updatePayload = { text: "bbc" };
      const updatedMessage = { id: "1", text: "bbc" };
      const mockChain = createSupabaseMock({
        data: updatedMessage,
        error: null
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app)
        .patch("/messages/1")
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedMessage);
      expect(mockChain.update).toHaveBeenCalledWith(
        updatePayload
      );
      expect(mockChain.eq).toHaveBeenCalledWith("id", "1");
      expect(mockChain.maybeSingle).toHaveBeenCalled();
    });

    it("returns 404 if message to update does not exist", async () => {
      const mockChain = createSupabaseMock({
        data: null,
        error: null
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app)
        .patch("/messages/999")
        .send({ text: "Not avail" });

      expect(res.status).toBe(404);
      expect(res.text).toBe("Resource not found.");
    });

    it("returns 500 if update fails", async () => {
      const mockChain = createSupabaseMock({
        data: null,
        error: new Error("Update failed")
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app)
        .patch("/messages/1")
        .send({ text: "Error" });

      expect(res.status).toBe(500);
      expect(res.text).toBe("Request failed: Update failed");
    });
  });

  describe("DELETE /messages/:id", () => {
    it("deletes a message and returns 204", async () => {
      const deletedMessage = { id: "1", text: "Deleted" };
      const mockChain = createSupabaseMock({
        data: deletedMessage,
        error: null
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app).delete("/messages/1");

      expect(res.status).toBe(204);
      expect(res.text).toBe("");
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith("id", "1");
      expect(mockChain.maybeSingle).toHaveBeenCalled();
    });

    it("returns 404 if message to delete does not exist", async () => {
      const mockChain = createSupabaseMock({
        data: null,
        error: null
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app).delete("/messages/999");

      expect(res.status).toBe(404);
      expect(res.text).toBe("Resource not found.");
    });

    it("returns 500 if delete fails", async () => {
      const mockChain = createSupabaseMock({
        data: null,
        error: new Error("Delete failed")
      });
      supabase.from.mockReturnValue(mockChain);

      const res = await request(app).delete("/messages/1");

      expect(res.status).toBe(500);
      expect(res.text).toBe("Request failed: Delete failed");
    });
  });
});
