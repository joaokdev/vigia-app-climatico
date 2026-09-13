/**
 * Vault — Entropy
 * Approximate password entropy from character-set pool size.
 * bits = length × log2(pool)
 */

(function (global) {
  "use strict";

  const Vault = (global.Vault = global.Vault || {});

  /* ==========================================================
     POOL SIZES — character-category contributions
     ========================================================== */
  const POOL = {
    lower: 26,
    upper: 26,
    digit: 10,
    symbol: 32,
  };

  /* ==========================================================
     DETECTION & SCORING
     ========================================================== */
  function detectPool(password) {
    if (!password) return 0;

    let pool = 0;
    if (/[a-z]/.test(password)) pool += POOL.lower;
    if (/[A-Z]/.test(password)) pool += POOL.upper;
    if (/\d/.test(password)) pool += POOL.digit;
    if (/[^A-Za-z0-9]/.test(password)) pool += POOL.symbol;
    return pool;
  }

  function calculateEntropy(password) {
    const value = String(password || "");
    const length = value.length;
    const pool = detectPool(value);

    if (!length || !pool) {
      return { bits: 0, pool: 0, length: 0 };
    }

    const bits = Math.round(length * Math.log2(pool));
    return { bits, pool, length };
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */
  Vault.entropy = {
    POOL,
    detectPool,
    calculateEntropy,
  };
})(typeof window !== "undefined" ? window : globalThis);
