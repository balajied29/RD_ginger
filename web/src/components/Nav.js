'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Dashboard' },
  { href: '/purchase/new', label: 'Purchase' },
  { href: '/payment/new', label: 'Payment' },
  { href: '/farmers', label: 'Farmers' },
];

/** Top header + fixed bottom tab bar (44px+ targets, mobile-first). */
export default function Nav({ user, onLogout }) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
          <span className="font-semibold">LEDGER</span>
          <div className="flex items-center gap-3 text-sm">
            {user.role === 'admin' && (
              <Link
                href="/admin/audit"
                className="min-h-[44px] px-1 leading-[44px] text-slate-600 transition-colors hover:text-slate-900"
              >
                Audit
              </Link>
            )}
            <span className="text-slate-600">{user.name}</span>
            <button
              onClick={onLogout}
              className="min-h-[44px] rounded-lg border border-slate-200 px-3 text-slate-600 transition-colors hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`min-h-[44px] py-3 text-center text-sm transition-colors ${
                  active
                    ? 'font-semibold text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
