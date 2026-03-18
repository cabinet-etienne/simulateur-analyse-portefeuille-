import { cn } from "@repo/ui";
import { ASSET_CLASS_LABELS } from "@repo/core-domain";

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: ASSET_CLASS_LABELS.ETF, href: "/dashboard/etf" },
  { label: ASSET_CLASS_LABELS.BOND, href: "/dashboard/obligations" },
  { label: ASSET_CLASS_LABELS.STRUCTURED, href: "/dashboard/produits-structures" },
  { label: ASSET_CLASS_LABELS.SCPI, href: "/dashboard/scpi" },
  { label: "Portefeuille", href: "/dashboard/portefeuille" },
];

interface SidebarProps {
  currentPath?: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-surface-200 bg-surface-0">
      <div className="border-b border-surface-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-brand-900">Patrimoine</h2>
        <p className="text-2xs text-brand-400">Platform v0.1</p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={cn(
                  "block rounded px-3 py-2 text-sm transition-colors duration-150",
                  currentPath === item.href
                    ? "bg-brand-50 font-medium text-brand-900"
                    : "text-brand-600 hover:bg-surface-50 hover:text-brand-900",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-surface-200 px-6 py-4">
        <a
          href="/admin"
          className="text-sm text-brand-400 hover:text-brand-700"
        >
          Console Admin
        </a>
      </div>
    </aside>
  );
}
