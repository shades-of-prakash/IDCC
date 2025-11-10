// src/utils/time.js

/**
 * Converts milliseconds to HH:MM:SS format.
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted time string (e.g., "01:23:45")
 */
export const formatTime = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};
