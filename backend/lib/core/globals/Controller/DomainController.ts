import { Router, type RequestHandler } from "express";
import type { Controller } from "../../Interfaces/Controller.interface.js";
import type { Route } from "../../Interfaces/Route.interface.js";

type RoutesProvider = {
  getRoutes: () => Route[];
  getRouterMiddleware?: () => RequestHandler[];
};

abstract class DomainController implements Controller {
  public path: string;
  public router = Router();
  protected routes: Route[];

  constructor(path: string, routesProvider: RoutesProvider) {
    this.path = path;
    this.routes = routesProvider.getRoutes();
    this.applyRouterMiddleware(routesProvider);
    this.initiateRoutes();
  }

  protected applyRouterMiddleware(routesProvider: RoutesProvider): void {
    const middlewares = routesProvider.getRouterMiddleware?.();
    if (middlewares && middlewares.length > 0) {
      middlewares.forEach((middleware) => {
        this.router.use(middleware);
      });
    }
  } 

  protected initiateRoutes(): void {
    this.routes.forEach((route) => {
      const routePath = route.path.startsWith("/") ? route.path : `/${route.path}`;
      this.router[route.method](this.path + routePath, ...route.handler);
    });
  }
}

export default DomainController;
