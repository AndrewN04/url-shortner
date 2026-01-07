import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { config } from "./config";

/**
 * Generate a cryptographically secure API key
 * Format: prefix_randomBytes (e.g., "sk_a1b2c3d4...")
 */
export function generateApiKey(): string {
    const bytes = randomBytes(32);
    return `sk_${bytes.toString("hex")}`;
}

/**
 * Hash an API key with server-side pepper using HMAC-SHA256
 * This is a one-way hash - the original key cannot be recovered
 */
export function hashApiKey(apiKey: string): string {
    const hmac = createHmac("sha256", config.apiKeyPepper());
    hmac.update(apiKey);
    return hmac.digest("hex");
}

/**
 * Verify an API key against a stored hash using constant-time comparison
 * Prevents timing attacks
 */
export function verifyApiKey(apiKey: string, storedHash: string): boolean {
    const inputHash = hashApiKey(apiKey);

    // Ensure both are the same length before comparison
    if (inputHash.length !== storedHash.length) {
        return false;
    }

    try {
        return timingSafeEqual(
            Buffer.from(inputHash, "hex"),
            Buffer.from(storedHash, "hex")
        );
    } catch {
        return false;
    }
}

/**
 * Generate a cryptographically secure short code
 * Uses URL-safe characters (no confusing chars like 0/O, 1/l/I)
 * Uses rejection sampling to avoid modulo bias
 */
export function generateShortCode(length: number = config.codeLength): string {
    const alphabet =
        "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
    const alphabetLength = alphabet.length; // 58
    // Largest multiple of 58 that fits in a byte (232 = 58 * 4)
    const maxValid = 256 - (256 % alphabetLength);

    let code = "";
    while (code.length < length) {
        const bytes = randomBytes(length - code.length + 10); // Request extra to handle rejections
        for (let i = 0; i < bytes.length && code.length < length; i++) {
            const byte = bytes[i]!;
            // Reject bytes that would cause modulo bias
            if (byte < maxValid) {
                code += alphabet[byte % alphabetLength];
            }
        }
    }

    return code;
}
