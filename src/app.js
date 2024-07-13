import express from "express";
import cors from 'cors';
import 'dotenv/config'
import { dbConnect } from "./config/dbConfig.js";

dbConnect()

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ "message": "hello world!" }));


export default app;



