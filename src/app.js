import express from "express";
import cors from 'cors';
import 'dotenv/config'
import { createLogger } from "winston";
import LokiTransport from "winston-loki";

import promClient from 'prom-client';
import responseTime from "response-time";

import { dbConnect } from "./config/dbConfig.js";
import "./config/cloudinaryConfig.js";
import userRoutes from "./routes/users.routes.js";
import { notFound, errorMiddleware } from "./middlewares/errors.middlewares.js";
import productRoutes from './routes/products.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import presignedUrlRoutes from './routes/urls.routes.js';
import commentRoutes from "./routes/comments.routes.js";
import cartRoutes from './routes/carts.routes.js';
import orderRoutes from './routes/orders.routes.js';
import paymentRoutes from './routes/paymentConfirmation.routes.js';
import couponRoutes from './routes/coupons.routes.js';
import categoryRoutes from './routes/category.routes.js';

// prometheus setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;

collectDefaultMetrics({
    register: promClient.register
})

const reqResTime = new promClient.Histogram({
    name: "http_express_req_res_time",
    help: "indicate request and respose time",
    labelNames: ['method', "route", "statusCode"],
    buckets: [1, 50, 100, 200, 250, 500, 800, 1000, 1500, 2000]
})


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
app.use(responseTime((req, res, time) => {
    reqResTime.labels({
        method: req.method,
        route: req.url,
        statusCode: res.statusCode
    }).observe(time)
}))



app.get("/", (req, res) => res.json({ "message": "hello world!" }));

app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", promClient.register.contentType)
    const metrics = await promClient.register.metrics();
    res.send(metrics)
})

app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/rating", ratingRoutes)
app.use("/api/presignedurl", presignedUrlRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes)
app.use("/api/coupon", couponRoutes)
app.use("/api/categories", categoryRoutes);


// errors
app.use(notFound);
app.use(errorMiddleware)


export default app;
export { logger }



