import express, { type Application } from "express";
import { connectDb } from "./utils/connectDb.js";
import ErrorMidlleware from "./core/globals/middleware/error.middleware.js";
import logger from "./core/globals/middleware/logger.middleware.js";
import type { Controller } from "./core/Interfaces/Controller.interface.js";
import { CorsMiddlewareStar } from "./core/globals/middleware/cors.middleware.js";

import path from "node:path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Match routes that don't start with /api and don't have file extensions (assets)
const reactRouter = /^\/(?!api\/)(?!.*\.[a-z0-9]+$).*/i

export class App {
    public express: Application;
    public port: number;

    constructor(controllers: Controller[], port: number) {
        this.express = express();
        this.port = port;

        this.initiateDbConnection();
        this.initiateMiddleware();
        this.initiateControllers(controllers);
        this.initiateErrorHandling();
        this.initiateFrontend();
    }

    private async initiateDbConnection(): Promise<void> {
        await connectDb();
    }

    private initiateMiddleware(): void {
        this.express.use(express.static(path.join(__dirname, "views/dist"), {
            index: false,
            setHeaders(res, filePath) {
                if (filePath.endsWith('.js')) {
                    res.setHeader('Content-Type', 'application/javascript');
                }
            }
        }))

        this.express.use(express.json());
        this.express.use(logger);
        this.express.use(CorsMiddlewareStar)

    }

    private initiateControllers(controllers: Controller[]): void {

        controllers.forEach(controller => {
            this.express.use("/api", controller.router)
        });


    }

    private initiateErrorHandling(): void {
        this.express.use(ErrorMidlleware)

    }

    private initiateFrontend(): void {
        this.express.use( (req, res,) => {
            res.sendFile(path.join(__dirname, "views/dist", "index.html"))
        })
    }



    public listen(): void {
        this.express.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`)
        })
    }
}