import { describe, it, expect } from "vitest";
import { makeJWT, validateJWT } from "./auth.js";

describe("JWT Authentication", () => {
  const secret = "test-secret-key";
  const userID = "123e4567-e89b-12d3-a456-426614174000";

  it("should successfully create and validate a JWT", () => {
    const token = makeJWT(userID, 60, secret);
    const extractedUserId = validateJWT(token, secret);
    expect(extractedUserId).toBe(userID);
  });

  it("should reject an expired token", () => {
    // Setting expiresIn to a negative value ensures it expires instantly
    const token = makeJWT(userID, -1, secret);
    expect(() => validateJWT(token, secret)).toThrow();
  });

  it("should reject a token signed with the wrong secret", () => {
    const token = makeJWT(userID, 60, secret);
    const wrongSecret = "incorrect-secret";
    expect(() => validateJWT(token, wrongSecret)).toThrow();
  });
});
