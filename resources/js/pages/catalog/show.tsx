import { Head, Link, router } from '@inertiajs/react';
import { index as catalogIndex, show as catalogShow } from '@/routes/catalog';
import { index as cartIndex } from '@/routes/cart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/breadcrumbs';
import DeliveryCalculator from '@/components/delivery-calculator';
import ProductFaq from '@/components/product-faq';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import {
    CheckCircle, Package, Ruler, Weight, Palette, Layers,
    ShoppingCart, ShoppingBag, Sofa, Search, ChevronLeft, ChevronRight, Minus, Plus, X,
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface Image {
    id: number;
    image_path: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    parent?: Category | null;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: number;
    description: string;
    material: string | null;
    color: string | null;
    width: number | null;
    height: number | null;
    depth: number | null;
    weight: number | null;
    stock_quantity: number;
    is_featured: boolean;
    primary_image: Image | null;
    images: Image[];
    category: Category | null;
}

interface DeliveryZone {
    id: number;
    area: string;
    fee: number;
}

interface ProvinceGroup {
    name: string;
    zones: DeliveryZone[];
}

interface Props {
    product: Product;
    relatedProducts: Product[];
    provinces: ProvinceGroup[];
}

export default function CatalogShow({ product, relatedProducts, provinces }: Props) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(
        product.primary_image?.image_path || product.images.find(i => i.is_primary)?.image_path || product.images[0]?.image_path || null
    );
    const [addedOpen, setAddedOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const allImages = useMemo(() => {
        const images = product.images.length > 0
            ? [...product.images].sort((a, b) => a.sort_order - b.sort_order)
            : product.primary_image
                ? [{ id: 0, image_path: product.primary_image.image_path, alt_text: null, sort_order: 0, is_primary: true }]
                : [];
        return images;
    }, [product.images, product.primary_image]);

    function addToCart() {
        router.post(`/cart/${product.id}`, { quantity }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setAddedOpen(true);
                setQuantity(1);
            },
        });
    }

    function openLightbox(index: number) {
        setLightboxIndex(index);
        setLightboxOpen(true);
    }

    function navigateLightbox(dir: -1 | 1) {
        setLightboxIndex(i => (i + dir + allImages.length) % allImages.length);
    }

    function buildBreadcrumbs() {
        const crumbs: { title: string; href: string }[] = [
            { title: 'Catalog', href: catalogIndex().url },
        ];
        const hierarchy: Category[] = [];
        let cat: Category | null = product.category;
        while (cat) {
            hierarchy.unshift(cat);
            cat = cat.parent ?? null;
        }
        for (const c of hierarchy) {
            crumbs.push({ title: c.name, href: catalogIndex().url + '?categories=' + c.slug });
        }
        crumbs.push({ title: product.name, href: '#' });
        return crumbs;
    }

    function stockBadgeVariant(): 'default' | 'secondary' | 'destructive' | 'outline' {
        if (product.stock_quantity > 5) return 'default';
        if (product.stock_quantity > 0) return 'secondary';
        return 'destructive';
    }

    function stockLabel(): string {
        if (product.stock_quantity > 5) return 'In Stock';
        if (product.stock_quantity > 0) return 'Low Stock';
        return 'Out of Stock';
    }

    return (
        <>
            <Head title={product.name}>
                <meta name="description" content={product.description ? product.description.substring(0, 160) : `${product.name} — ${formatPrice(product.price)}`} />
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.description ? product.description.substring(0, 160) : `${product.name} — Handcrafted furniture at Lumaro Furniture Studio`} />
                {selectedImage && <meta property="og:image" content={`/storage/${selectedImage}`} />}
                <meta property="og:type" content="product" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Breadcrumbs breadcrumbs={buildBreadcrumbs()} />
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div>
                        <div
                            className="bg-muted relative aspect-square overflow-hidden rounded-xl border cursor-pointer"
                            onClick={() => {
                                const idx = selectedImage ? allImages.findIndex(i => i.image_path === selectedImage) : 0;
                                openLightbox(Math.max(0, idx));
                            }}
                        >
                            {selectedImage ? (
                                <img
                                    src={'/storage/' + selectedImage}
                                    alt={product.name}
                                    className="size-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center">
                                    <Sofa className="size-24 text-muted-foreground/20" />
                                </div>
                            )}
                            {product.is_featured && (
                                <Badge className="absolute left-3 top-3 bg-amber-600 hover:bg-amber-700 text-white border-0">Featured</Badge>
                            )}
                            <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:opacity-100">
                                <Search className="size-4" />
                            </div>
                        </div>

                        {allImages.length > 1 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto">
                                {allImages.map((image, i) => (
                                    <button
                                        key={image.id || i}
                                        type="button"
                                        onClick={() => setSelectedImage(image.image_path)}
                                        className={`relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-md border transition-all ${
                                            selectedImage === image.image_path
                                                ? 'ring-2 ring-amber-600 border-amber-600'
                                                : 'hover:border-muted-foreground/50'
                                        }`}
                                    >
                                        <img
                                            src={'/storage/' + image.image_path}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                    {product.name}
                                </h1>
                                {product.sku && (
                                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                                        <Package className="size-3.5" />
                                        SKU: {product.sku}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex items-baseline gap-3">
                            <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
                            <Badge variant={stockBadgeVariant()}>{stockLabel()}</Badge>
                        </div>

                        {product.stock_quantity > 0 && (
                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex items-center gap-1 rounded-lg border">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-9"
                                        disabled={quantity <= 1}
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    >
                                        <Minus className="size-3.5" />
                                    </Button>
                                    <span className="flex w-10 items-center justify-center text-sm tabular-nums font-medium">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-9"
                                        disabled={quantity >= product.stock_quantity}
                                        onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                                    >
                                        <Plus className="size-3.5" />
                                    </Button>
                                </div>
                                <Button size="lg" className="gap-2 flex-1 sm:flex-none" onClick={addToCart}>
                                    <ShoppingCart className="size-5" />
                                    Add to Cart
                                </Button>
                            </div>
                        )}

                        {product.description && (
                            <>
                                <Separator className="my-6" />
                                <div>
                                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description</h2>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            </>
                        )}

                        <Separator className="my-6" />

                        <div>
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Specifications</h2>
                            <div className="space-y-3">
                                {product.material && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Layers className="text-muted-foreground size-4 shrink-0" />
                                        <span className="text-muted-foreground w-24 text-xs font-medium">Material</span>
                                        <span>{product.material}</span>
                                    </div>
                                )}
                                {product.color && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Palette className="text-muted-foreground size-4 shrink-0" />
                                        <span className="text-muted-foreground w-24 text-xs font-medium">Color</span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="inline-block size-3 rounded-full border" style={{ backgroundColor: product.color.toLowerCase() }} />
                                            {product.color}
                                        </span>
                                    </div>
                                )}
                                {product.width && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Ruler className="text-muted-foreground size-4 shrink-0" />
                                        <span className="text-muted-foreground w-24 text-xs font-medium">Dimensions</span>
                                        <span>
                                            {product.width}"W x {product.height}"H x{' '}
                                            {product.depth}"D
                                        </span>
                                    </div>
                                )}
                                {product.weight !== null && product.weight !== undefined && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Weight className="text-muted-foreground size-4 shrink-0" />
                                        <span className="text-muted-foreground w-24 text-xs font-medium">Weight</span>
                                        <span>{product.weight} kg</span>
                                    </div>
                                )}
                                {product.stock_quantity >= 0 && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Package className="text-muted-foreground size-4 shrink-0" />
                                        <span className="text-muted-foreground w-24 text-xs font-medium">Stock</span>
                                        <span>{product.stock_quantity} units</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <DeliveryCalculator
                                productId={product.id}
                                productName={product.name}
                                productPrice={Number(product.price)}
                                productWeight={product.weight}
                                quantity={quantity}
                                provinces={provinces}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <ProductFaq />
                </div>

                {relatedProducts.length > 0 && (
                    <>
                        <Separator className="my-12" />
                        <div>
                            <h2 className="mb-6 text-xl font-semibold tracking-tight">Related Products</h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {relatedProducts.map(rp => (
                                    <Link
                                        key={rp.id}
                                        href={catalogShow({ product: rp.slug })}
                                        className="group block"
                                    >
                                        <div className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                                {rp.primary_image ? (
                                                    <img
                                                        src={'/storage/' + (typeof rp.primary_image === 'object' ? rp.primary_image.image_path : rp.primary_image)}
                                                        alt={rp.name}
                                                        loading="lazy"
                                                        className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center">
                                                        <Sofa className="size-12 text-muted-foreground/20" />
                                                    </div>
                                                )}
                                                {rp.is_featured && (
                                                    <Badge className="absolute left-2 top-2 bg-amber-600 hover:bg-amber-700 text-white border-0">Featured</Badge>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="truncate text-sm font-medium group-hover:text-amber-600 transition-colors">{rp.name}</h3>
                                                <p className="mt-1.5 text-lg font-bold">{formatPrice(rp.price)}</p>
                                                <div className="text-muted-foreground mt-1.5 flex items-center gap-2 text-xs">
                                                    {rp.material && <span>{rp.material}</span>}
                                                    {rp.material && rp.color && <span>·</span>}
                                                    {rp.color && <span>{rp.color}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Dialog open={addedOpen} onOpenChange={setAddedOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle className="size-6" />
                            </div>
                            <DialogTitle>Added to Cart</DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center gap-4 py-4">
                        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                            {selectedImage ? (
                                <img src={'/storage/' + selectedImage} alt={product.name} className="size-full object-cover" />
                            ) : (
                                <Package className="size-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{product.name}</p>
                            <p className="text-muted-foreground text-xs">Qty: {quantity}</p>
                            <p className="mt-1 font-semibold">{formatPrice(product.price * quantity)}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" className="flex-1 gap-2" onClick={() => setAddedOpen(false)}>
                            <ShoppingBag className="size-4" />
                            Continue Shopping
                        </Button>
                        <Link href={cartIndex()} className="flex-1" onClick={() => setAddedOpen(false)}>
                            <Button className="w-full gap-2">
                                <ShoppingCart className="size-4" />
                                View Cart
                            </Button>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>

            {lightboxOpen && allImages.length > 0 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="size-8" />
                    </button>
                    <img
                        src={'/storage/' + allImages[lightboxIndex].image_path}
                        alt={product.name}
                        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                        aria-label="Next image"
                    >
                        <ChevronRight className="size-8" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setLightboxOpen(false)}
                        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                        aria-label="Close lightbox"
                    >
                        <X className="size-6" />
                    </button>
                    <div className="absolute bottom-4 text-sm text-white/70">
                        {lightboxIndex + 1} / {allImages.length}
                    </div>
                </div>
            )}
        </>
    );
}
