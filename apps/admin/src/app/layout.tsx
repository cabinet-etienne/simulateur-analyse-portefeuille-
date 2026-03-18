import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@repo/ui/styles";

export const metadata: Metadata = {
  title: "Admin — Patrimoine Platform",
  description: "Console d'administration de la plateforme patrimoniale",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-surface-50 font-sans">
        <div className="flex">
          <aside className="flex h-screen w-56 flex-col border-r border-surface-200 bg-surface-0">
            <div className="border-b border-surface-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-brand-900">Admin</h2>
            </div>
            <nav className="flex-1 px-3 py-4">
              <ul className="space-y-1">
                {[
                  { label: "Produits", href: "/produits" },
                  { label: "Utilisateurs", href: "/utilisateurs" },
                  { label: "Référentiels", href: "/referentiels" },
                  { label: "Monitoring", href: "/monitoring" },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block rounded px-3 py-2 text-sm text-brand-600 hover:bg-surface-50"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
