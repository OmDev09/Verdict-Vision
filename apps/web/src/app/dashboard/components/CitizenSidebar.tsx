'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Plus, LogOut, Wallet, Moon, Sun, Search, User } from 'lucide-react';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { SiteLogo } from '@/components/site-logo';

export function CitizenSidebar({
    history,
    loadHistory,
    currentSearchId,
    startNewChat
}: {
    history: any[];
    loadHistory?: (id: string) => void;
    currentSearchId?: string;
    startNewChat?: () => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleStartNewChat = () => {
        setIsSidebarOpen(false);
        if (pathname === '/dashboard') {
            if (startNewChat) startNewChat();
        } else {
            router.push('/dashboard');
        }
    };

    const handleHistoryClick = (id: string) => {
        setIsSidebarOpen(false);
        if (pathname === '/dashboard' && loadHistory) {
            loadHistory(id);
        } else {
            router.push(`/dashboard?historyId=${id}`);
        }
    };

    return (
        <>
            {/* Mobile Top Header */}
            <div className="md:hidden flex items-center justify-between p-3 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-muted-foreground">
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div onClick={handleStartNewChat} className="cursor-pointer flex items-center">
                        <SiteLogo href="#" />
                    </div>
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-bold tracking-wider uppercase">Citizen</span>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Actual Sidebar */}
            <div className={cn(
                "fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#f9f9f9] dark:bg-[#171717] border-r flex flex-col transition-transform duration-300 md:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                "h-[100dvh]" // ensure it takes full height on mobile Safari
            )}>
                {/* Mobile close button inside sidebar */}
                <div className="md:hidden flex justify-end p-2 pb-0">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-8 w-8 text-muted-foreground">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-3">
                    <Button onClick={handleStartNewChat} className="w-full justify-between h-10 bg-background hover:bg-muted text-foreground border shadow-sm font-medium rounded-xl">
                        <span>New search</span>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 no-scrollbar pt-2">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-2">History</div>
                    {history.length > 0 ? history.map(h => (
                        <button
                            key={h.id}
                            onClick={() => handleHistoryClick(h.id)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5 truncate",
                                currentSearchId === h.id ? "bg-black/5 dark:bg-white/5 font-semibold text-foreground" : "font-medium text-muted-foreground"
                            )}
                        >
                            {h.query}
                        </button>
                    )) : (
                        <div className="px-3 text-sm text-balance text-muted-foreground/60">No recent searches yet.</div>
                    )}
                </div>

                <div className="p-3 border-t space-y-1 bg-[#f9f9f9] dark:bg-[#171717]">
                    <Link href="/wallet" className="block" onClick={() => setIsSidebarOpen(false)}>
                        <Button variant={pathname === '/wallet' ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-11 rounded-xl text-muted-foreground hover:text-foreground">
                            <Wallet className="h-4 w-4" />
                            <span className="flex-1 text-left">Wallet</span>
                            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md">{user?.credits || 0} credits</span>
                        </Button>
                    </Link>

                    {/* Profile Dialog */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl text-muted-foreground hover:text-foreground">
                                <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="flex-1 text-left font-medium text-foreground truncate">{user?.name}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Account Profile</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center py-6 space-y-4">
                                <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl uppercase mx-auto border-4 border-background shadow-xl">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">{user?.email}</p>
                                </div>
                                <div className="w-full pt-6 mt-2 space-y-2 border-t border-border/50">
                                    <Button variant="outline" onClick={toggle} className="w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground hover:text-foreground">
                                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Toggle Theme
                                    </Button>
                                    <Button variant="destructive" onClick={logout} className="w-full justify-start gap-3 h-12 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive shadow-none hover:text-destructive-foreground">
                                        <LogOut className="h-4 w-4" /> Log out completely
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}
