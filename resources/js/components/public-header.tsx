import { Link, usePage } from '@inertiajs/react';
import { home, login, register, dashboard } from '@/routes';
import { index as catalogIndex } from '@/routes/catalog';
import { index as cartIndex } from '@/routes/cart';
import { ShoppingCart, Menu, X, Sofa } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function NavLink({ href, children, onClick }: { href: Parameters<typeof Link>[0]['href']; children: React.ReactNode; onClick?: () => void }) {
    const { url } = usePage();
    const target = typeof href === 'string' ? href : href?.url ?? '/';
    const isActive = url === target || (target !== '/' && url.startsWith(target));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'text-sm font-medium transition-colors',
                isActive
                    ? 'text-amber-900 font-semibold dark:text-amber-400'
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            )}
        >
            {children}
        </Link>
    );
}

export function PublicHeader() {
    const { auth, cart_count } = usePage<{ auth: { user: any }; cart_count: number }>().props;
    const cartCount = cart_count ?? 0;
    const [mobileOpen, setMobileOpen] = useState(false);

    // Prevent body scrolling when the mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        // Cleanup function to ensure scrolling is restored if the component unmounts
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-stone-50/95 backdrop-blur supports-[backdrop-filter]:bg-stone-50/75 dark:border-stone-800 dark:bg-stone-950/95 dark:supports-[backdrop-filter]:bg-stone-950/75">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href={home()} className="flex items-center gap-2.5 group">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-amber-900 text-stone-100 transition-transform group-hover:scale-105 dark:bg-amber-800">
                        <Sofa className="size-5" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                        Lumaro <span className="font-normal text-amber-900 dark:text-amber-400">Furniture Studio</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    <NavLink href={home()}>Home</NavLink>
                    <NavLink href={catalogIndex()}>Catalog</NavLink>
                    <NavLink href={cartIndex()}>
                        <span className="relative inline-flex items-center gap-1.5">
                            <ShoppingCart className="size-5" />
                            {cartCount > 0 && (
                                <span className="absolute -right-2.5 -top-2 flex size-4 animate-in fade-in zoom-in items-center justify-center rounded-full bg-amber-900 text-[10px] font-bold text-stone-100 dark:bg-amber-700">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </span>
                    </NavLink>
                    {auth.user ? (
                        <Link href={dashboard()}>
                            <Button size="sm" className="bg-amber-900 text-stone-50 hover:bg-amber-950 dark:bg-amber-800 dark:hover:bg-amber-700">Dashboard</Button>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href={login()}>
                                <Button variant="ghost" size="sm" className="text-stone-700 hover:text-stone-900 dark:text-stone-300">Log in</Button>
                            </Link>
                            <Link href={register()}>
                                <Button size="sm" className="bg-amber-900 text-stone-50 hover:bg-amber-950 dark:bg-amber-800 dark:hover:bg-amber-700">Register</Button>
                            </Link>
                        </div>
                    )}
                </nav>

                <button
                    type="button"
                    className="relative md:hidden text-stone-800 dark:text-stone-200"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="size-5" /> : (
                        <span className="relative inline-flex">
                            <Menu className="size-5" />
                            {cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex size-2.5 rounded-full bg-amber-900 dark:bg-amber-700" />
                            )}
                        </span>
                    )}
                </button>
            </div>

            {mobileOpen && (
                <div className="absolute left-0 top-16 w-full h-[calc(100vh-4rem)] overflow-y-auto border-t border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950 md:hidden">
                    <nav className="flex flex-col gap-4 px-4 py-6">
                        <NavLink href={home()} onClick={() => setMobileOpen(false)}>Home</NavLink>
                        <NavLink href={catalogIndex()} onClick={() => setMobileOpen(false)}>Catalog</NavLink>
                        <NavLink href={cartIndex()} onClick={() => setMobileOpen(false)}>
                            <span className="flex items-center gap-2">
                                Cart
                                {cartCount > 0 && (
                                    <span className="flex size-5 animate-in fade-in zoom-in items-center justify-center rounded-full bg-amber-900 text-[10px] font-bold text-stone-100 dark:bg-amber-700">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </span>
                        </NavLink>
                        
                        <div className="mt-2 border-t border-stone-200 pt-4 dark:border-stone-800">
                            {auth.user ? (
                                <Link href={dashboard()} onClick={() => setMobileOpen(false)}>
                                    <Button size="sm" className="w-full bg-amber-900 text-stone-50 hover:bg-amber-950 dark:bg-amber-800">Dashboard</Button>
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link href={login()} onClick={() => setMobileOpen(false)}>
                                        <Button variant="outline" size="sm" className="w-full">Log in</Button>
                                    </Link>
                                    <Link href={register()} onClick={() => setMobileOpen(false)}>
                                        <Button size="sm" className="w-full bg-amber-900 text-stone-50 hover:bg-amber-950 dark:bg-amber-800">Register</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}