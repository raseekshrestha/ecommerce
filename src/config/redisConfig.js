import { Redis } from "ioredis";

const redisClient = new Redis();

// const redisClient = new Redis({
//     port: 11350, // Redis port
//     host: "redis-11350.c15.us-east-1-2.ec2.redns.redis-cloud.com", // Redis host
//     username: "default", // needs Redis >= 6
//     password: "GQv4qfcP0cen1k7bM0jErGynfXFqUfgD",
//     db: 0, // Defaults to 0
// });

export default redisClient