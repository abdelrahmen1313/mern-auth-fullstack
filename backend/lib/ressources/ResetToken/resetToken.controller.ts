import DomainController from "../../core/globals/Controller/DomainController.js";
import ResetTokenRoutes from "./resetToken.routes.js";

class resetTokenController extends DomainController {

    constructor( router : ResetTokenRoutes = new ResetTokenRoutes())
    {
        super("/reset", router)
    }
}

export default resetTokenController;