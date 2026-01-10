// src/middleware/validateMiddleware.ts
import { type Request,type Response, type NextFunction } from "express";
import HttpException from "../../Exceptions/http.exception.js";
/**
 * @param fileName - The schema file name (without extension)
 * @param schemaKey - The specific schema export name inside that file
 */
export function validateMiddleware(fileName: string, schemaKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Dynamically import the schema file
      const schemaModule = await import(`../DTO/${fileName}.ts`);

      // Pick the schema by key
      const schema = schemaModule[schemaKey];
      if (!schema) {
        console.log(`Schema "${schemaKey}" not found in ../DTO/${fileName}.ts`)
        throw new HttpException(500, "INTERNAL SERVER ERROR");
      }

      // Validate request body (adapt for query/params if needed)
      schema.parse(req.body);

      next();
    } catch (err) {
      next(err)
    }
  };
}
