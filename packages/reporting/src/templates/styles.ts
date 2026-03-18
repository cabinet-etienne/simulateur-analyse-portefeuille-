/**
 * Tokens de style pour le rapport PDF.
 * Alignés avec le design system Tailwind de l'app web.
 *
 * Ces valeurs seront utilisées par @react-pdf/renderer
 * qui ne supporte pas Tailwind directement.
 */
export const reportStyles = {
  colors: {
    brand900: "#102a43",
    brand700: "#334e68",
    brand500: "#627d98",
    brand100: "#d9e2ec",
    accent500: "#d4981c",
    accent100: "#fdf0d5",
    surface0: "#ffffff",
    surface50: "#f8f9fa",
    surface100: "#f1f3f5",
    textPrimary: "#102a43",
    textSecondary: "#627d98",
    success: "#2d6a4f",
    warning: "#b07d14",
    error: "#9b2c2c",
  },
  fonts: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
    mono: "Courier",
  },
  fontSizes: {
    title: 24,
    h1: 18,
    h2: 14,
    body: 10,
    caption: 8,
  },
  spacing: {
    page: { top: 40, right: 40, bottom: 60, left: 40 },
    section: 20,
    paragraph: 8,
  },
} as const;
