import authRoutes from "./auth.router.js";
import DomainController from "../../shared/Controller/DomainController.js";

class authController extends DomainController {
    constructor(router: authRoutes = new authRoutes()) {
        super("/auth", router);
    }
}

export default authController;