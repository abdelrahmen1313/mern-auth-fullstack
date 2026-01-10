import { generateRandomNumbe, generateSecureRandomString, generateSimpleRandomString } from "../../utils/stringUtils.js";

export function createTokenHash(length : number) {
    return generateSecureRandomString(length) + "." + generateRandomNumbe(2) + "." + generateSimpleRandomString(4)
}

