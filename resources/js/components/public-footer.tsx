import { Link } from '@inertiajs/react';
import { home, dashboard } from '@/routes';
import { index as catalogIndex } from '@/routes/catalog';
import { Sofa } from 'lucide-react';

export function PublicFooter() {
    return (
        <footer className="border-t border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Link href={home()} className="flex items-center gap-2">
                            <Sofa className="size-5 text-amber-900 dark:text-amber-400" />
                            <span className="font-bold text-stone-900 dark:text-stone-100">Lumaro Furniture Studio</span>
                        </Link>
                        <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
                            Crafted with passion. Premium handcrafted furniture made with warm, natural wood and timeless brown neutral aesthetics.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Quick Links</h3>
                        <ul className="mt-3 space-y-2">
                            <li>
                                <Link href={home()} className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href={catalogIndex()} className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">Catalog</Link>
                            </li>
                            <li>
                                <Link href={dashboard()} className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">Dashboard</Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Contact Studio</h3>
                        <ul className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-400">
                            <li>info@lumarofurniture.co.za</li>
                            <li>+27 11 234 5678</li>
                            <li>Johannesburg, South Africa</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-stone-200/80 dark:border-stone-800 pt-6 text-center text-xs text-stone-500 dark:text-stone-500">
                    &copy; {new Date().getFullYear()} Lumaro Furniture Studio. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
