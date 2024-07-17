import express from "express";
import cors from 'cors';
import 'dotenv/config'
import { createLogger, transports } from "winston";
import LokiTransport from "winston-loki";

import { dbConnect } from "./config/dbConfig.js";
import "./config/cloudinaryConfig.js";
import userRoutes from "./routes/users.routes.js";
import { notFound, errorMiddleware } from "./middlewares/errors.middlewares.js";
import productRoutes from './routes/products.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import presignedUrlRoutes from './routes/urls.routes.js';
import commentRoutes from "./routes/comments.routes.js";

const LokiOptions = {
    transports: [
        new LokiTransport({
            labels: {
                appName: "express monitor"
            },
            host: "http://127.0.0.1:3100"
        })
    ]
};
const logger = createLogger(LokiOptions);



dbConnect()

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ "message": "hello world!" }));

app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/rating", ratingRoutes)
app.use("/api/presignedurl", presignedUrlRoutes)
app.use("/api/comments", commentRoutes)


// errors
app.use(notFound);
app.use(errorMiddleware)


export default app;
export { logger }



