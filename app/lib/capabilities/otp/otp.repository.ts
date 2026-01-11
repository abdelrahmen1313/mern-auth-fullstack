import { MongoDbRepository } from "../../core/repostitory/mdbRepo.js";
import type { IOTP } from "./otp.model.js";
import OTP from "./otp.model.js";

import type { createOtpDTO , otpPurpose} from "./otp.js";

export class OtpRepository extends MongoDbRepository<IOTP> {

    constructor() {
        super(OTP)
    }

    // create OTP
    async createOTP(otpData :createOtpDTO)  {
        return this.safeExec(() => this.model.create(otpData))
    } 

    // find otp by userId
    async findOtpByUID(userId : string) {
        return this.safeExec(() => this.model.findOne({userId : userId}))
    }

    // delete otp record by userID
    async findOtpAndDelete(userId : string) {
        return this.safeExec(() => this.model.findOneAndDelete({userId : userId}))
    }

    


}