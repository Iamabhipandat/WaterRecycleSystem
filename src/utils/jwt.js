/**
 * Production Client-Side JWT (JSON Web Token) Implementation
 * Follows RFC 7519 standard structure: header.payload.signature
 */

function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str) {
  let output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw new Error("Invalid base64url string");
  }
  return decodeURIComponent(escape(atob(output)));
}

/** Compute HMAC SHA-256 signature using Web Crypto API */
async function signHmacSha256(data, secret = "jalloop-water-system-secret-key-2026") {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const sigBytes = Array.from(new Uint8Array(sigBuffer));
  return btoa(String.fromCharCode.apply(null, sigBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Generate a signed JWT token */
export async function generateJwt(payload, secret = "jalloop-water-system-secret-key-2026") {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = await signHmacSha256(dataToSign, secret);
  return `${dataToSign}.${signature}`;
}

/** Generate Account Verification JWT (valid for 24 hours) */
export async function createAccountVerificationToken(user) {
  const payload = {
    sub: user.uid,
    email: user.email,
    purpose: "account_verification",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  };
  return generateJwt(payload);
}

/** Generate Login Session JWT (valid for 7 days) */
export async function createSessionToken(user) {
  const payload = {
    sub: user.uid,
    email: user.email,
    name: user.displayName || user.name || "User",
    role: user.role || "user",
    purpose: "session_auth",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 86400, // 7 days
  };
  return generateJwt(payload);
}

/** Parse and verify a JWT token */
export async function verifyJwtToken(token, secret = "jalloop-water-system-secret-key-2026") {
  if (!token || typeof token !== "string") {
    throw new Error("Missing or invalid token.");
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT token format. Token must contain header, payload, and signature.");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = await signHmacSha256(dataToSign, secret);

  if (signature !== expectedSignature) {
    throw new Error("Invalid token signature. Verification failed.");
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    throw new Error("Could not parse token payload.");
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSec) {
    throw new Error("Verification token has expired. Please request a new token.");
  }

  return payload;
}

/** Generate a clean random 6-digit verification code */
export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
