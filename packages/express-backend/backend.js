import "dotenv/config";
import express from "express";
import { supabase } from "./utils/supabase.js";
import cors from "cors";
import {
  Client,
  Environment,
  LogLevel,
  OrdersController
} from "@paypal/paypal-server-sdk";

import userRouter from "./routes/users.js";
import postRouter from "./routes/posts.js";
import authRouter from "./routes/auth.js";
import messagesRouter from "./routes/messages.js";
import chatsRouter from "./routes/chats.js";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/auth", authRouter);
app.use("/messages", messagesRouter);
app.use("/chats", chatsRouter);

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true }
  }
});

const ordersController = new OrdersController(client);

// 1. Create Order Route
app.post("/api/orders", async (req, res) => {
  try {
    const { cart } = req.body; // Calculate real price on server using cart IDs
    const collect = {
      body: {
        intent: "CAPTURE",
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: "19.99" // Replace with dynamic server-calculated total
            }
          }
        ]
      },
      prefer: "return=minimal"
    };

    const { body, ...httpResponse } =
      await ordersController.createOrder(collect);
    res.status(httpResponse.statusCode).json(JSON.parse(body));
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

// 2. Capture Order Route
app.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal"
    };

    const { body, ...httpResponse } =
      await ordersController.captureOrder(collect);
    res.status(httpResponse.statusCode).json(JSON.parse(body));
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
});

app.listen(port, () =>
  console.log(`Listening at http://localhost:${port}`)
);
