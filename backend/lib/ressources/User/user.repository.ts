import type { ObjectId } from "mongoose";
import { NotFoundError } from "../../core/Errors/RepositoryErrors.js";
import { MongoDbRepository } from "../../core/repostitory/mdbRepo.js"
import User, { type IUser, type CreatePersonDTO } from "./user.model.js"
import { hashPassword } from "../../capabilities/auth/auth.utils.js";

export class UserRepository extends MongoDbRepository<IUser> {
  

    constructor() {
        super(User)
    }

    // update user password
    async updateUserPassword(secret: string, userId : string, hashedPassword : string) {
        if (secret != "pwdUpdateISecret") { throw new Error("Invalid Request")}
        
        return this.safeExec( () =>  this.model.findByIdAndUpdate(userId , { $set : { password : hashedPassword}}, { new : true}))
    }

    // create new user 
    async create(data: CreatePersonDTO) {
        return this.safeExec(() => this.model.create(data));
    }

    // find user by id
    async findUserById(id: string) {
        return this.safeExec(async () => {
            const _user = await this.model.findById(id).lean();
            if (!_user) throw new NotFoundError("User")
            return _user;

        })
    }
    // find single user
     async findUser(query : object) {
        return this.safeExec( async () => {
            const _user = await this.model.findOne(query);
           // if (!_user) throw new NotFoundError("User")
            return _user;
        })
    }

    // validate user
    async validateUser(id : string) {
        return this.safeExec(() => this.model.findByIdAndUpdate(
            {_id : id}, 
            { $set :
                 {isVerified : true , verifiedAt : new Date().toISOString()}
            })
        )
    }


}