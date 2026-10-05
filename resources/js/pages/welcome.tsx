import { Head, Link, usePage } from '@inertiajs/react';
import { index as catalogIndex } from '@/routes/catalog';
import { show as catalogShow } from '@/routes/catalog';
import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { Sofa, Truck, ShieldCheck, RefreshCw, ArrowRight, Star } from 'lucide-react';

type ProductImage = {
    id: number;
    image_path: string;
    is_primary: boolean;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    price: number;
    material: string | null;
    color: string | null;
    is_featured: boolean;
    primary_image: ProductImage | null;
};

type Category = {
    id: number;
    name: string;
    slug: string;
    products_count: number;
};

export default function Welcome() {
    const { featuredProducts, categories } = usePage<{
        featuredProducts: Product[];
        categories: Category[];
    }>().props;

    const heroImage = featuredProducts[0]?.primary_image?.image_path ?? null;

    return (
        <>
            <Head title="Lumaro Furniture Studio — Handcrafted Collection">
                <meta name="description" content="Lumaro Furniture Studio — Handcrafted furniture collection in rich brown and warm neutral tones. Quality artisan tables, sofas, chairs, and home decor." />
                <meta property="og:title" content="Lumaro Furniture Studio — Handcrafted Collection" />
                <meta property="og:description" content="Timeless handcrafted furniture designed with natural woods, warm brown tones, and organic neutral aesthetics." />
                {heroImage && <meta property="og:image" content={`/storage/${heroImage}`} />}
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
                <PublicHeader />

                <main className="flex-1">
                    <section className="relative overflow-hidden bg-gradient-to-br from-stone-200/60 via-amber-900/10 to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-neutral-950">
                        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                            <div className="grid items-center gap-12 lg:grid-cols-2">
                                <div>
                                    <Badge variant="outline" className="mb-4 border-amber-900/30 bg-amber-900/10 text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
                                        Lumaro Furniture Studio — Handcrafted Collection
                                    </Badge>
                                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-stone-900 dark:text-stone-50">
                                        Lumaro Furniture Studio
                                        <span className="block text-amber-900 dark:text-amber-400 mt-1 font-serif italic text-3xl sm:text-4xl lg:text-5xl">
                                            Brown & Neutral Tones
                                        </span>
                                    </h1>
                                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                                        Timeless artisan design and handcrafted quality. Explore our collection of wooden furniture, bespoke dining sets, plush seating, and warm neutral decor.
                                    </p>
                                    <div className="mt-8 flex flex-wrap gap-4">
                                        <Link href={catalogIndex()}>
                                            <Button size="lg" className="gap-2 bg-amber-900 text-stone-50 hover:bg-amber-950 dark:bg-amber-800 dark:hover:bg-amber-700 shadow-md">
                                                Explore Catalog
                                                <ArrowRight className="size-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`${catalogIndex().url}?is_featured=1`}>
                                            <Button variant="outline" size="lg" className="border-amber-900/30 text-stone-800 hover:bg-amber-900/10 dark:border-stone-700 dark:text-stone-200">
                                                View Featured
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-200/80 shadow-2xl dark:bg-stone-800 lg:aspect-[4/3] border border-stone-300/50 dark:border-stone-700">
                                    {heroImage ? (
                                        <img
                                            src={'/storage/' + heroImage}
                                            alt="Lumaro Furniture Studio Collection"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center bg-stone-200 dark:bg-stone-900">
                                            <Sofa className="size-32 text-amber-900/30 dark:text-amber-700/20" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {featuredProducts.length > 0 && (
                        <section className="py-16 sm:py-20 bg-stone-50 dark:bg-stone-950">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">Featured Studio Collection</h2>
                                        <p className="mt-2 text-stone-600 dark:text-stone-400">Handcrafted selections in rich wood, warm leather, and brown neutral tones</p>
                                    </div>
                                    <Link href={`${catalogIndex().url}?is_featured=1`}>
                                        <Button variant="ghost" className="gap-1 text-amber-900 dark:text-amber-400 hover:text-amber-950 hover:bg-amber-900/10">
                                            View All <ArrowRight className="size-4" />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {featuredProducts.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={catalogShow({ product: product.slug })}
                                            className="group block"
                                        >
                                            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
                                                    {product.primary_image ? (
                                                        <img
                                                            src={'/storage/' + product.primary_image.image_path}
                                                            alt={product.name}
                                                            loading="lazy"
                                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex size-full items-center justify-center">
                                                            <Sofa className="size-12 text-stone-400/40" />
                                                        </div>
                                                    )}
                                                    <Badge className="absolute left-2 top-2 bg-amber-900 text-stone-100 border-0 hover:bg-amber-950 dark:bg-amber-800">Featured</Badge>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="truncate text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors">{product.name}</h3>
                                                    <p className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100">{formatPrice(product.price)}</p>
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                                                        {product.material && <span>{product.material}</span>}
                                                        {product.material && product.color && <span>·</span>}
                                                        {product.color && <span>{product.color}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {categories.length > 0 && (
                        <section className="bg-stone-100/70 py-16 sm:py-20 dark:bg-stone-900/50 border-y border-stone-200/80 dark:border-stone-800">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">Shop by Studio Category</h2>
                                    <p className="mt-2 text-stone-600 dark:text-stone-400">Browse curated handcrafted pieces by space &amp; material</p>
                                </div>
                                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`${catalogIndex().url}?categories=${category.slug}`}
                                            className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex size-12 items-center justify-center rounded-lg bg-amber-900/10 text-amber-900 dark:bg-amber-950/60 dark:text-amber-400">
                                                    <Sofa className="size-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors">{category.name}</h3>
                                                    <p className="text-sm text-stone-500 dark:text-stone-400">{category.products_count} products</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="py-16 sm:py-20 bg-stone-50 dark:bg-stone-950">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h2 className="text-center text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">The Lumaro Studio Standard</h2>
                            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="text-center">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-900/10 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300">
                                        <Truck className="size-6" />
                                    </div>
                                    <h3 className="mt-4 font-semibold text-stone-900 dark:text-stone-100">White Glove Delivery</h3>
                                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Safe, direct delivery to your home or office</p>
                                </div>
                                <div className="text-center">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-900/10 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300">
                                        <ShieldCheck className="size-6" />
                                    </div>
                                    <h3 className="mt-4 font-semibold text-stone-900 dark:text-stone-100">Bespoke Guarantee</h3>
                                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Handcrafted durability designed to last generations</p>
                                </div>
                                <div className="text-center">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-900/10 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300">
                                        <RefreshCw className="size-6" />
                                    </div>
                                    <h3 className="mt-4 font-semibold text-stone-900 dark:text-stone-100">Personalized Service</h3>
                                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Dedicated studio consultations and custom finishes</p>
                                </div>
                                <div className="text-center">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-900/10 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300">
                                        <Star className="size-6" />
                                    </div>
                                    <h3 className="mt-4 font-semibold text-stone-900 dark:text-stone-100">Artisan Materials</h3>
                                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Sustainably sourced natural timber &amp; rich finishes</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-amber-900 py-16 dark:bg-amber-950 text-stone-100">
                        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-stone-50">Transform Your Space with Lumaro Furniture Studio</h2>
                            <p className="mt-3 text-lg text-amber-200/90 max-w-2xl mx-auto">Explore our exclusive catalog of handcrafted furniture in rich brown and neutral palettes.</p>
                            <Link href={catalogIndex()}>
                                <Button size="lg" variant="secondary" className="mt-6 gap-2 bg-stone-100 text-amber-950 hover:bg-white font-semibold">
                                    Explore Studio Catalog <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                        </div>
                    </section>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
