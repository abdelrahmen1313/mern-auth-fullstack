import crypto from "node:crypto"
export function createDeviceId() {

    const bytes = crypto.randomBytes(32);
    const now = new Date().getMilliseconds();
    const hash = crypto.createHash("md5").update(bytes).digest("hex");
    return hash + "." + now.toString()

}

/**
 * Creates an object with an expiresAt field.
 * @param {number} minutesFromNow - How many minutes until expiration.
 * @returns {Object} Object with expiresAt as an ISO string and timestamp.
 */
export function createExpiresAt(minutesFromNow : number) {
    if (typeof minutesFromNow !== "number" || minutesFromNow <= 0) {
        throw new Error("minutesFromNow must be a positive number.");
    }

    const now = new Date();
    const expiresDate = new Date(now.getTime() + minutesFromNow * 60 * 1000);

    return {
        createdAt: now.toISOString(),
        expiresAt: expiresDate.toISOString(), // Human-readable
        expiresAtTimestamp: expiresDate.getTime() // Numeric timestamp
    };
}

// Example usage:
try {
    const sessionData = createExpiresAt(30); // expires in 30 minutes
    console.log(sessionData);
    /*
    {
        createdAt: "2026-01-01T12:00:00.000Z",
        expiresAt: "2026-01-01T12:30:00.000Z",
        expiresAtTimestamp: 1767270600000
    }
    */
} catch (err) {
    console.error("Error:", err);
}
