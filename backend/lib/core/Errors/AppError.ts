/**
 * Custom Error Class for application-specific errors
 */
// core/errors/AppError.ts
export abstract class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
  }
}
