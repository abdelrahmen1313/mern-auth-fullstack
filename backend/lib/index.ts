import { stamp } from "./stamp.js";

console.log(stamp)

// --------- PROGRAM STARTS ----------------///
import { App } from "./app.js";
import UserController from "./ressources/User/user.controller.js";
import authController from "./capabilities/auth/auth.controller.js";

const app = new App(
    [
        new UserController(), new authController()
    ],
     Number(process.env.PORT) || 3003
)

app.listen();