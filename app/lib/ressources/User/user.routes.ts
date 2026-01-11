import type { Route } from "../../core/Interfaces/Route.interface.js";
import { type Request, type Response } from "express";

async function pong(req: Request, res: Response) {

    res.send("pong")
}

class UserRoutes {


    public getRoutes(): Route[] {
        return [


            {
                path: "/ping",
                method: "get",
                handler: [pong]
            },


        ];
    }




}

export default UserRoutes;
