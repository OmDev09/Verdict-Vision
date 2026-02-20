'use client';

import { useState } from 'react';

const TEXT =
  'Verdict Vision provides AI-generated legal information and does not replace professional legal advice.';

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 flex items-center justify-center gap-4 text-sm">
      <span className="flex-1 text-center">{TEXT}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-amber-700 dark:text-amber-300 hover:underline"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}
