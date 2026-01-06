import { NotFoundError } from "../../core/Errors/RepositoryErrors.js";
import { MongoDbRepository } from "../../core/repostitory/mdbRepo.js"
import User, { type IUser, type CreatePersonDTO } from "./user.model.js"

export class UserRepository extends MongoDbRepository<IUser> {
  

    constructor() {
        super(User)
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