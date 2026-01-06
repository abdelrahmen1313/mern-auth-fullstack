import express, { type Application } from "express";
import { connectDb } from "./utils/connectDb.js";
import ErrorMidlleware from "./core/midlleware/error.middleware.js";
import logger from "./core/midlleware/logger.middleware.js";
import type { Controller } from "./core/Interfaces/Controller.interface.js";
import { CorsMiddlewareStar } from "./core/midlleware/cors.middleware.js";



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
    }

    private async initiateDbConnection() : Promise<void> {
        await connectDb();
    }

    private initiateMiddleware(): void {
        // this.express.use() // -> Add your global middleware here
        this.express.use(express.json());
        this.express.use(logger);
        this.express.use(CorsMiddlewareStar)
    }

    private initiateControllers(controllers: Controller[]): void {

        controllers.forEach(controller => {
            this.express.use("/api", controller.router)
        });
    }

    private initiateErrorHandling() : void {
        this.express.use(ErrorMidlleware)
        
    }

    

    public listen() : void {
        this.express.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`)
        })
    }
}