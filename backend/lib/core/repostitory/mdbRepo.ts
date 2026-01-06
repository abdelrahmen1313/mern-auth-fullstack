// THIS IS A STARTER POINT FILE
import type { Model } from "mongoose";
import { ConflictError, ValidationError } from "../Errors/RepositoryErrors.js";

export abstract class MongoDbRepository<T> {
    protected constructor(protected readonly model: Model<T>) { }

    protected handleError(err: any): any {

        // Dupplicate Key ( unique index)
        if (err?.code === 11000) {
            throw new ConflictError('Duplicate resource');
        }

        // Mongoose validation
        if (err?.name === 'ValidationError') {
            throw new ValidationError(err.message);
        }

        // Invalid ObjectId
        if (err?.name === 'CastError') {
            throw new ValidationError('Invalid identifier format');
        }

        // Already normalized
        if (err?.statusCode) {
            throw err;
        }

        throw new Error('Unexpected database error');

    }

    protected async safeExec<R>(fn: () => Promise<R>): Promise<R> {
        try {
            return await fn();
        } catch (err) {
            return this.handleError(err);
        }
    }

    protected async aggregate<R>(pipeline: any[]) {
        return this.safeExec(() => this.model.aggregate<R>(pipeline));
    }

}