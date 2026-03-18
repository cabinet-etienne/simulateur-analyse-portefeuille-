import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@repo/ui/styles";

export const metadata: Metadata = {
  title: "Patrimoine Platform — Analyse de Portefeuille",
  description: "Plateforme d'analyse patrimoniale pour cabinets de gestion de patrimoine",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-surface-50 font-sans">
        {children}
      </body>
    </html>
  );
}
