import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { responseEnhancer } from "./middleware/response.js"
import logger from "./utils/logger.js"
import handlerHttpError from "./utils/handleError.js"
import mainRouter from "./routes/index.js"

const app = express()
const port = 3000
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev"
// @ts-ignore
app.use(morgan(morganFormat, { stream: logger.stream }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(responseEnhancer)

app.use("/api", mainRouter)

//错误处理
app.use(handlerHttpError)

app.listen(port, (err) => {
    if (err) {
        console.error(`Error starting server: ${err.message}`)
    } else {
        console.log(`Server listening on port ${port}`)
    }
})
