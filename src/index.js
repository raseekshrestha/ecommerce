import app, { logger } from './app.js';




const PORT = process.env.PORT;

app.listen(PORT, () => {
    logger.info("server running")
    console.log("server running on port", PORT);
})