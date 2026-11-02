import "dotenv/config";
import express from "express";
import { supabase } from "./utils/supabase.js";
import cors from "cors";

import userRouter from "./routes/users.js";
import postRouter from "./routes/posts.js";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/posts", postRouter);

app.listen(port, () =>
  console.log(`Listening at http://localhost:${port}`)
);
