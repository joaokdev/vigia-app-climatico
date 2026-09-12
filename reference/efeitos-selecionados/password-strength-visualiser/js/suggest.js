/**
 * Vault — Suggest
 * Generate a strong example passphrase for the Suggest strong action.
 * Pattern: word-word-##!word (mixed alphabet, digits, and a symbol).
 */

(function (global) {
  "use strict";

  const Vault = (global.Vault = global.Vault || {});

  /* ==========================================================
     WORD & SYMBOL LISTS — extend WORDS for more variety
     ========================================================== */
  const WORDS = [
    "moth",
    "lantern",
    "orbit",
    "velvet",
    "cinder",
    "harbor",
    "quartz",
    "ember",
    "willow",
    "cobalt",
    "nexus",
    "prism",
    "falcon",
    "marble",
    "onyx",
    "ridge",
    "sable",
    "thunder",
    "violet",
    "zephyr",
    "aurora",
    "basalt",
    "cipher",
    "drift",
    "echo",
    "frost",
    "glacier",
    "helix",
    "ivory",
    "jasper",
    "kettle",
    "lotus",
    "mirage",
    "nebula",
    "opal",
    "phoenix",
    "quill",
    "raven",
    "solstice",
    "timber",
  ];

  const SYMBOLS = ["!", "@", "#", "$", "%", "&", "*", "?"];

  /* ==========================================================
     HELPERS
     ========================================================== */
  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function randomDigits(count) {
    let out = "";
    for (let i = 0; i < count; i++) {
      out += String(Math.floor(Math.random() * 10));
    }
    return out;
  }

  /* ==========================================================
     GENERATOR
     ========================================================== */
  function generateStrongPassword() {
    const w1 = pick(WORDS);
    const w2 = pick(WORDS);
    let w3 = pick(WORDS);
    while (w3 === w1 || w3 === w2) {
      w3 = pick(WORDS);
    }

    const digits = randomDigits(2);
    const symbol = pick(SYMBOLS);

    // Pattern inspired by moth-lantern-84!orbit — mixed case via word boundaries
    return w1 + "-" + w2 + "-" + digits + symbol + w3;
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */
  Vault.suggest = {
    generateStrongPassword: generateStrongPassword,
  };
})(typeof window !== "undefined" ? window : globalThis);
