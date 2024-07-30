import { Redis } from "ioredis";


// const redisClient = new Redis({
//     port: 6379,
//     host: "redis",
//     db: 0
// });


const redisClient = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB,
});

export default redisClient