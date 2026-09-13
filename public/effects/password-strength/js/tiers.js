/**
 * Vault — Tiers
 * Strength tier thresholds and presentation copy.
 * Maps entropy bits → empty / paperclip / padlock / deadbolt / vault.
 */

(function (global) {
  "use strict";

  const Vault = (global.Vault = global.Vault || {});

  /* ==========================================================
     TIER TABLE — edit thresholds, titles, and colours here
     ========================================================== */
  const TIERS = [
    {
      id: 0,
      label: "empty",
      title: "Nenhuma trava",
      color: "#8b8f9a",
      minBits: 0,
      maxBits: 0,
      fixedMessage: "A porta está aberta.",
    },
    {
      id: 1,
      label: "paperclip",
      title: "Um clipe de papel",
      color: "#f97356",
      minBits: 1,
      maxBits: 29,
      fixedMessage: "Quebrada instantaneamente.",
    },
    {
      id: 2,
      label: "padlock",
      title: "Um cadeado",
      color: "#e8c547",
      minBits: 30,
      maxBits: 49,
      fixedMessage: null,
    },
    {
      id: 3,
      label: "deadbolt",
      title: "Uma tranca",
      color: "#b8e04a",
      minBits: 50,
      maxBits: 69,
      fixedMessage: null,
    },
    {
      id: 4,
      label: "vault",
      title: "Um cofre bancário",
      color: "#3dff8a",
      minBits: 70,
      maxBits: Infinity,
      fixedMessage: null,
    },
  ];

  const TIER_LABELS = TIERS.map(function (t) {
    return t.label;
  });

  /* ==========================================================
     RESOLUTION
     ========================================================== */
  function getTier(bits) {
    const value = Number(bits) || 0;
    if (value <= 0) return TIERS[0];
    if (value < 30) return TIERS[1];
    if (value < 50) return TIERS[2];
    if (value < 70) return TIERS[3];
    return TIERS[4];
  }

  function resolveFeedback(bits) {
    const tier = getTier(bits);
    const crack = Vault.crackTime.estimateCrackTime(bits);
    const message = tier.fixedMessage || crack.message;

    return {
      tier: tier.id,
      label: tier.label,
      title: tier.title,
      color: tier.color,
      message: message,
      bits: bits,
      crack: crack,
    };
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */
  Vault.tiers = {
    TIERS,
    TIER_LABELS,
    getTier,
    resolveFeedback,
  };
})(typeof window !== "undefined" ? window : globalThis);
