/**
 * Vault — Crack Time
 * Brute-force crack-time estimates from entropy bits.
 * Assumes GUESSES_PER_SECOND online guesses (default 1e9).
 */

(function (global) {
  "use strict";

  const Vault = (global.Vault = global.Vault || {});

  /* ==========================================================
     CONSTANTS
     ========================================================== */
  const GUESSES_PER_SECOND = 1e9;

  const UNITS = [
    { limit: 60, divisor: 1, singular: "second", plural: "seconds" },
    { limit: 3600, divisor: 60, singular: "minute", plural: "minutes" },
    { limit: 86400, divisor: 3600, singular: "hour", plural: "hours" },
    { limit: 31536000, divisor: 86400, singular: "day", plural: "days" },
    { limit: 31536000000, divisor: 31536000, singular: "year", plural: "years" },
  ];

  /* ==========================================================
     FORMATTING
     ========================================================== */
  function formatCount(n) {
    if (n < 1000) return String(Math.round(n));
    if (n < 1e6) {
      const k = n / 1000;
      return (k < 10 ? k.toFixed(1).replace(/\.0$/, "") : String(Math.round(k))) + " thousand";
    }
    if (n < 1e9) {
      const m = n / 1e6;
      return (m < 10 ? m.toFixed(1).replace(/\.0$/, "") : String(Math.round(m))) + " million";
    }
    if (n < 1e12) {
      const b = n / 1e9;
      return (b < 10 ? b.toFixed(1).replace(/\.0$/, "") : String(Math.round(b))) + " billion";
    }
    return "effectively forever";
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return "instantly";
    if (seconds < 0.5) return "less than a second";
    if (seconds < 1.5) return "1 second";

    for (let i = 0; i < UNITS.length; i++) {
      const unit = UNITS[i];
      if (seconds < unit.limit) {
        const value = seconds / unit.divisor;
        if (unit.singular === "year" && value >= 1000) {
          const label = formatCount(value);
          if (label === "effectively forever") return label;
          return label + " years";
        }
        const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
        const display = Number.isInteger(rounded)
          ? String(rounded)
          : String(rounded).replace(/\.0$/, "");
        const name = Number(display) === 1 ? unit.singular : unit.plural;
        return display + " " + name;
      }
    }

    const years = seconds / 31536000;
    if (years > 1e12) return "effectively forever";
    const label = formatCount(years);
    if (label === "effectively forever") return label;
    return label + " years";
  }

  /* ==========================================================
     ESTIMATE
     ========================================================== */
  function estimateCrackTime(bits, guessesPerSecond) {
    const rate = guessesPerSecond || GUESSES_PER_SECOND;

    if (!bits || bits <= 0) {
      return {
        seconds: 0,
        label: "instantly",
        message: "The door is standing open.",
      };
    }

    // Cap exponent to avoid Infinity for very strong passwords
    const safeBits = Math.min(bits, 128);
    const combinations = Math.pow(2, safeBits);
    const seconds = combinations / rate;
    const label = bits >= 100 ? "effectively forever" : formatDuration(seconds);

    let message;
    if (bits < 30) {
      message = "Cracked instantly.";
    } else if (label === "effectively forever") {
      message = "Effectively forever.";
    } else if (label === "instantly" || label === "less than a second") {
      message = "Cracked instantly.";
    } else {
      message = "Cracked in " + label + ".";
    }

    return { seconds, label, message };
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */
  Vault.crackTime = {
    GUESSES_PER_SECOND,
    formatDuration,
    estimateCrackTime,
  };
})(typeof window !== "undefined" ? window : globalThis);
