'use client';
import Link from 'next/link';

interface Props {
  msg: string; sub: string; btnHref: string; btnLabel: string;
}

export default function AccessBlocked({ msg, sub, btnHref, btnLabel }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-sm p-8">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{msg}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{sub}</p>
        <Link href={btnHref}
          className="inline-flex px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all"
        >
          {btnLabel}
        </Link>
      </div>
    </div>
  );
}
