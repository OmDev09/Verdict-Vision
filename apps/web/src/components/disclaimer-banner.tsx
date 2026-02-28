'use client';

import { useState } from 'react';

const TEXT =
  'Verdict Vision provides AI-generated legal information and does not replace professional legal advice.';

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="border-b border-amber-400/35 bg-gradient-to-r from-amber-300/20 via-orange-300/15 to-amber-200/20 px-3 py-2 text-amber-950 dark:border-amber-300/25 dark:from-amber-400/16 dark:via-orange-400/12 dark:to-amber-500/10 dark:text-amber-100">
      <div className="container mx-auto flex items-center justify-center gap-4 text-sm">
        <span className="flex-1 text-center font-medium">{TEXT}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-md border border-amber-600/25 px-2 py-0.5 text-amber-800 hover:bg-amber-500/10 dark:border-amber-300/25 dark:text-amber-200 dark:hover:bg-amber-200/10"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
      </div>
    </div>
  );
}
