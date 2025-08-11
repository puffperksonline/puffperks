import React from 'react';

/**
 * Determines whether to use black or white text based on the brightness of a background color.
 * @param {string} hexColor - The background color in hex format (e.g., "#RRGGBB").
 * @returns {string} - Returns '#000000' (black) for light backgrounds or '#FFFFFF' (white) for dark backgrounds.
 */
export const getTextColor = (hexColor) => {
  if (!hexColor) {
    return '#FFFFFF'; // Default to white if no color is provided
  }

  // Remove the hash at the start if it's there
  const sanitizedHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;

  // If the hex is short (e.g., #FFF), expand it to the full 6-digit format
  const fullHex = sanitizedHex.length === 3
    ? sanitizedHex.split('').map(char => char + char).join('')
    : sanitizedHex;
  
  // Ensure we have a valid 6-digit hex code before parsing
  if (fullHex.length !== 6) {
    return '#FFFFFF'; // Return default for invalid hex codes
  }

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // HSP (Highly Sensitive Poo) color model formula
  const luminance = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  // If luminance > 127.5, the background is light, so we use dark text.
  // Otherwise, the background is dark, so we use light text.
  return luminance > 127.5 ? '#000000' : '#FFFFFF';
};