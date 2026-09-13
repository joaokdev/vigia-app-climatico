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
    { limit: 60, divisor: 1, singular: "segundo", plural: "segundos" },
    { limit: 3600, divisor: 60, singular: "minuto", plural: "minutos" },
    { limit: 86400, divisor: 3600, singular: "hora", plural: "horas" },
    { limit: 31536000, divisor: 86400, singular: "dia", plural: "dias" },
    { limit: 31536000000, divisor: 31536000, singular: "ano", plural: "anos" },
  ];

  /* ==========================================================
     FORMATTING
     ========================================================== */
  function formatCount(n) {
    if (n < 1000) return String(Math.round(n));
    if (n < 1e6) {
      const k = n / 1000;
      return (k < 10 ? k.toFixed(1).replace(/\.0$/, "") : String(Math.round(k))) + " mil";
    }
    if (n < 1e9) {
      const m = n / 1e6;
      const value = m < 10 ? m.toFixed(1).replace(/\.0$/, "") : String(Math.round(m));
      return value + (Number(value) === 1 ? " milhão de" : " milhões de");
    }
    if (n < 1e12) {
      const b = n / 1e9;
      const value = b < 10 ? b.toFixed(1).replace(/\.0$/, "") : String(Math.round(b));
      return value + (Number(value) === 1 ? " bilhão de" : " bilhões de");
    }
    return "praticamente para sempre";
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return "instantaneamente";
    if (seconds < 0.5) return "menos de um segundo";
    if (seconds < 1.5) return "1 segundo";

    for (let i = 0; i < UNITS.length; i++) {
      const unit = UNITS[i];
      if (seconds < unit.limit) {
        const value = seconds / unit.divisor;
        if (unit.singular === "ano" && value >= 1000) {
          const label = formatCount(value);
          if (label === "praticamente para sempre") return label;
          return label + " anos";
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
    if (years > 1e12) return "praticamente para sempre";
    const label = formatCount(years);
    if (label === "praticamente para sempre") return label;
    return label + " anos";
  }

  /* ==========================================================
     ESTIMATE
     ========================================================== */
  function estimateCrackTime(bits, guessesPerSecond) {
    const rate = guessesPerSecond || GUESSES_PER_SECOND;

    if (!bits || bits <= 0) {
      return {
        seconds: 0,
        label: "instantaneamente",
        message: "A porta está aberta.",
      };
    }

    // Cap exponent to avoid Infinity for very strong passwords
    const safeBits = Math.min(bits, 128);
    const combinations = Math.pow(2, safeBits);
    const seconds = combinations / rate;
    const label = bits >= 100 ? "praticamente para sempre" : formatDuration(seconds);

    let message;
    if (bits < 30) {
      message = "Quebrada instantaneamente.";
    } else if (label === "praticamente para sempre") {
      message = "Praticamente para sempre.";
    } else if (label === "instantaneamente" || label === "menos de um segundo") {
      message = "Quebrada instantaneamente.";
    } else {
      message = "Quebrada em " + label + ".";
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
