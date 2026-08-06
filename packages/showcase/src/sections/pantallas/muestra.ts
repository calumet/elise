/**
 * Imágenes de muestra como SVG embebido. La vitrina y la auditoría corren sin
 * red, y una imagen que no llega mide cero y rompe la medición.
 */
export const muestra = (etiqueta: string, color: string, ancho = 120, alto = 120) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}">` +
      `<rect width="${ancho}" height="${alto}" fill="${color}"/>` +
      `<text x="${ancho / 2}" y="${alto / 2 + 5}" font-family="sans-serif" font-size="14" fill="white" text-anchor="middle">${etiqueta}</text>` +
      `</svg>`,
  )}`;
