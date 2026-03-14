'use client';

import { FormEvent, useState } from 'react';

export default function AdminTokenForm() {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {
          'x-admin-token': token,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to authenticate admin token');
      }

      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to authenticate admin token');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <label className="block text-sm font-medium text-rose-900" htmlFor="admin-token-input">
        Admin token
      </label>
      <input
        id="admin-token-input"
        type="password"
        autoComplete="off"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        className="w-full rounded-xl border border-rose-300 px-3 py-2 text-sm text-slate-900"
        placeholder="Enter ADMIN_TOKEN"
        required
      />
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting || !token.trim()}
        className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Verifying...' : 'Unlock Admin Dashboard'}
      </button>
    </form>
  );
}
