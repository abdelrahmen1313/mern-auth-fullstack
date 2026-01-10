import UserRoutes from "./user.routes.js";
import DomainController from "../../core/globals/Controller/DomainController.js";

class UserController extends DomainController {
  constructor(router: UserRoutes = new UserRoutes()) {
    super("/user", router);
  }
}

export default UserController;