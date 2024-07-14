import express from "express";
import cors from 'cors';
import 'dotenv/config'

import { dbConnect } from "./config/dbConfig.js";
import userRoutes from "./routes/users.routes.js";
import { notFound, errorMiddleware } from "./middlewares/errors.middlewares.js";



dbConnect()

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ "message": "hello world!" }));

app.use("/api/users", userRoutes)


// errors
app.use(notFound);
app.use(errorMiddleware)


export default app;



