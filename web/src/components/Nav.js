'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, BuyIcon, PayIcon, PeopleIcon, ExitIcon } from './Icons';

const tabs = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/purchase/new', label: 'Buy', Icon: BuyIcon },
  { href: '/payment/new', label: 'Pay', Icon: PayIcon },
  { href: '/farmers', label: 'Farmers', Icon: PeopleIcon },
];

/**
 * One short word + one icon per destination — readable with very
 * limited English. Bottom tab bar on every screen size; respects
 * iPhone safe areas when installed as a PWA.
 */
export default function Nav({ user, onLogout }) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
          <span className="text-lg font-semibold">LEDGER</span>
          <div className="flex items-center gap-2">
            {user.role === 'admin' && (
              <Link
                href="/admin/audit"
                className="flex min-h-[44px] items-center px-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
              >
                Audit
              </Link>
            )}
            <span className="hidden text-sm text-slate-600 sm:block">{user.name}</span>
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              <ExitIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {tabs.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className={`text-xs ${active ? 'font-semibold' : ''}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
