'use client';

import { useState } from 'react';

export default function AdminLogoutButton() {
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    try {
      await fetch('/api/admin/session', { method: 'DELETE' });
      window.location.reload();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
