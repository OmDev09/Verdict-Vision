'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/contexts/auth-context';
import { paymentsApi } from '@/lib/api';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, h: (r: unknown) => void) => void };
  }
}

type Plan = { id: string; name: string; credits: number; amount: number; amountInPaise: number; keyId?: string };

export default function WalletPage() {
  const router = useRouter();
  const { user, loading: authLoading, refetch } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<Array<{ id: string; amount: number; status: string; creditsAdded: number | null; plan: string | null; createdAt: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([paymentsApi.plans(), paymentsApi.history()]).then(([p, h]) => {
      setPlans(p);
      setHistory(h);
    }).catch(() => {});
  }, [user]);

  async function handlePurchase(planId: string) {
    if (!user) return;
    setLoading(true);
    try {
      const order = await paymentsApi.createOrder(planId);
      if (order.razorpayOrderId && order.keyId && typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          order_id: order.razorpayOrderId,
          handler: async (res: { razorpay_payment_id: string; razorpay_order_id: string }) => {
            await paymentsApi.confirm(order.orderId, res.razorpay_payment_id, res.razorpay_order_id);
            await refetch();
            const [, h] = await Promise.all([paymentsApi.plans(), paymentsApi.history()]);
            setHistory(h);
          },
        });
        rzp.open();
      } else {
        await refetch();
        const [, h] = await Promise.all([paymentsApi.plans(), paymentsApi.history()]);
        setHistory(h);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-gradient">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-2xl font-bold mb-2">Wallet</h1>
          <p className="text-muted-foreground mb-6">Current balance: <strong>{user.credits} credits</strong></p>

          <h2 className="font-semibold text-lg mb-4">Add credits</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card-premium p-6 flex flex-col"
              >
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <p className="text-2xl font-bold mt-2 text-foreground">₹{plan.amount}</p>
                <p className="text-sm text-muted-foreground">{plan.credits} credits</p>
                <Button
                  className="mt-4 w-full rounded-xl"
                  disabled={loading}
                  onClick={() => handlePurchase(plan.id)}
                >
                  Buy
                </Button>
              </motion.div>
            ))}
          </div>

          <h2 className="font-semibold text-lg mb-4">Payment history</h2>
          <ul className="space-y-2">
            {history.map((p) => (
              <li key={p.id} className="card-premium flex flex-col gap-1 py-3 px-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span>₹{p.amount} · {p.plan ?? 'N/A'} · {p.status}</span>
                <span className="text-muted-foreground">{p.creditsAdded != null ? `+${p.creditsAdded} credits` : ''} · {new Date(p.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
            {history.length === 0 && <p className="text-muted-foreground">No payments yet.</p>}
          </ul>
        </motion.div>
      </main>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
