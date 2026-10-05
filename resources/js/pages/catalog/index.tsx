import { Head, Link, router } from '@inertiajs/react';
import { index as catalogIndex, show as catalogShow } from '@/routes/catalog';
import { index as cartIndex } from '@/routes/cart';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { formatPrice } from '@/lib/utils';
import {
    Search, X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight,
    ShoppingCart, Sofa,
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback, memo } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
}

interface ProductImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sku: string;
    material: string | null;
    color: string | null;
    is_featured: boolean;
    stock_quantity: number;
    primary_image: ProductImage | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
    from: number;
    to: number;
}

interface Filters {
    search?: string;
    categories?: string[];
    materials?: string[];
    colors?: string[];
    price_min?: number;
    price_max?: number;
    sort?: string;
}

interface Props {
    products: PaginatedData<Product>;
    categories: Category[];
    materials: string[];
    colors: string[];
    filters: Filters;
}

function useCatalogFilters(filters: Filters) {
    const [search, setSearch] = useState(filters.search || '');
    const [priceMin, setPriceMin] = useState(filters.price_min?.toString() || '');
    const [priceMax, setPriceMax] = useState(filters.price_max?.toString() || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.categories || []);
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>(filters.materials || []);
    const [selectedColors, setSelectedColors] = useState<string[]>(filters.colors || []);
    const [sort, setSort] = useState(filters.sort || 'latest');

    const buildParams = useCallback(() => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (selectedCategories.length) params.categories = selectedCategories.join(',');
        if (selectedMaterials.length) params.materials = selectedMaterials.join(',');
        if (selectedColors.length) params.colors = selectedColors.join(',');
        if (priceMin) params.price_min = priceMin;
        if (priceMax) params.price_max = priceMax;
        if (sort && sort !== 'latest') params.sort = sort;
        return params;
    }, [search, selectedCategories, selectedMaterials, selectedColors, priceMin, priceMax, sort]);

    const navigate = useCallback((overrides?: Record<string, string>) => {
        const params = overrides ?? buildParams();
        router.get(catalogIndex().url, params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [buildParams]);

    return {
        search, setSearch,
        priceMin, setPriceMin,
        priceMax, setPriceMax,
        selectedCategories, setSelectedCategories,
        selectedMaterials, setSelectedMaterials,
        selectedColors, setSelectedColors,
        sort, setSort,
        buildParams, navigate,
    };
}

const FilterDropdown = memo(function FilterDropdown({
    id, label, count, openDropdown, setOpenDropdown, children, orientation = 'horizontal',
}: {
    id: string; label: string; count: number;
    openDropdown: string | null; setOpenDropdown: (v: string | null) => void;
    children: React.ReactNode;
    orientation?: 'horizontal' | 'vertical';
}) {
    const isVertical = orientation === 'vertical';

    return (
        <div className={isVertical ? 'w-full' : 'relative'}>
            <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    isVertical ? 'w-full justify-between' : ''
                } ${
                    openDropdown === id
                        ? 'border-amber-900 bg-amber-900/10 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 font-medium'
                        : 'border-input bg-background hover:bg-accent'
                }`}
            >
                <div className="flex items-center gap-1.5">
                    {label}
                    {count > 0 && (
                        <Badge variant="secondary" className="px-1 text-xs">{count}</Badge>
                    )}
                </div>
                <ChevronDown className={`size-3.5 transition-transform ${openDropdown === id ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === id && (
                <div className={
                    isVertical
                        ? 'mt-2 w-full rounded-lg border bg-card p-3 shadow-sm'
                        : 'absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border bg-card p-3 shadow-lg'
                }>
                    {children}
                </div>
            )}
        </div>
    );
});

function ProductCard({ product }: { product: Product }) {
    const [addingId, setAddingId] = useState<number | null>(null);

    function handleQuickAdd(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setAddingId(product.id);
        router.post(`/cart/${product.id}`, {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setAddingId(null),
        });
    }

    return (
        <Link
            href={catalogShow({ product: product.slug })}
            className="group block"
        >
            <div className="bg-card text-card-foreground relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {product.primary_image ? (
                        <img
                            src={'/storage/' + product.primary_image.image_path}
                            alt={product.name}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center">
                            <Sofa className="size-14 text-muted-foreground/20" />
                        </div>
                    )}
                    <div className="absolute left-2 top-2 flex gap-1">
                        {product.is_featured && (
                            <Badge className="bg-amber-900 hover:bg-amber-950 text-stone-100 border-0 dark:bg-amber-800">Featured</Badge>
                        )}
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                            <Badge variant="secondary" className="text-xs">Low Stock</Badge>
                        )}
                        {product.stock_quantity === 0 && (
                            <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                        )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button
                            size="sm"
                            className="w-full gap-1.5 bg-stone-100 text-stone-900 hover:bg-white font-medium"
                            disabled={product.stock_quantity === 0 || addingId === product.id}
                            onClick={handleQuickAdd}
                        >
                            <ShoppingCart className="size-3.5" />
                            {addingId === product.id ? 'Adding...' : 'Quick Add'}
                        </Button>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="truncate text-sm font-medium group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors">{product.name}</h3>
                    <p className="mt-1.5 text-lg font-bold">{formatPrice(product.price)}</p>
                    <div className="text-muted-foreground mt-1.5 flex items-center gap-2 text-xs">
                        {product.material && <span>{product.material}</span>}
                        {product.material && product.color && <span>·</span>}
                        {product.color && (
                            <span className="flex items-center gap-1">
                                <span className="inline-block size-2.5 rounded-full border" style={{ backgroundColor: product.color.toLowerCase() }} />
                                {product.color}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function renderCategoryTree(
    cats: Category[],
    selectedCategories: string[],
    onToggle: (slug: string) => void,
    depth = 0,
) {
    return cats.map(cat => (
        <div key={cat.id}>
            <label className={`flex cursor-pointer items-center gap-2 py-1.5 text-sm ${depth > 0 ? 'ml-4' : ''}`}>
                <Checkbox
                    checked={selectedCategories.includes(cat.slug)}
                    onCheckedChange={() => onToggle(cat.slug)}
                />
                <span className="flex-1">{cat.name}</span>
            </label>
            {cat.children && cat.children.length > 0 && (
                <div className="ml-2 border-l pl-2">
                    {renderCategoryTree(cat.children, selectedCategories, onToggle, depth + 1)}
                </div>
            )}
        </div>
    ));
}

const FilterBar = memo(function FilterBar({
    search, onSearchChange, onClearSearch,
    selectedCategories, selectedMaterials, selectedColors,
    priceMin, onPriceMinChange, priceMax, onPriceMaxChange, sort,
    onToggleCategory, onToggleMaterial, onToggleColor,
    onSortChange, onClearFilters, onPriceApply,
    hasActiveFilters,
    categories, materials, colors,
    openDropdown, setOpenDropdown, dropdownRef,
    orientation = 'horizontal'
}: {
    search: string; onSearchChange: (v: string) => void; onClearSearch: () => void;
    selectedCategories: string[]; selectedMaterials: string[]; selectedColors: string[];
    priceMin: string; onPriceMinChange: (v: string) => void; priceMax: string; onPriceMaxChange: (v: string) => void; sort: string;
    onToggleCategory: (slug: string) => void; onToggleMaterial: (m: string) => void; onToggleColor: (c: string) => void;
    onSortChange: (v: string) => void; onClearFilters: () => void; onPriceApply: () => void;
    hasActiveFilters: boolean;
    categories: Category[]; materials: string[]; colors: string[];
    openDropdown: string | null; setOpenDropdown: (v: string | null) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    orientation?: 'horizontal' | 'vertical';
}) {
    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.search = search;
        router.get(catalogIndex().url, params, { preserveState: true, preserveScroll: true });
    }

    const isVertical = orientation === 'vertical';

    return (
        <div ref={dropdownRef} className={`flex gap-3 ${isVertical ? 'flex-col items-stretch' : 'flex-wrap items-center'}`}>
            <form onSubmit={handleSearchSubmit} className={`relative ${isVertical ? 'w-full' : 'min-w-[200px] flex-1 lg:flex-none'}`}>
                <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-2.5 size-4" />
                <Input
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Search products..."
                    className="h-9 pl-8 pr-8 text-sm"
                />
                {search && (
                    <button
                        type="button"
                        onClick={onClearSearch}
                        className="text-muted-foreground hover:text-foreground absolute right-2 top-2.5"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </form>

            <FilterDropdown id="categories" label="Category" count={selectedCategories.length} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} orientation={orientation}>
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {renderCategoryTree(categories, selectedCategories, onToggleCategory)}
                </div>
            </FilterDropdown>

            <FilterDropdown id="materials" label="Material" count={selectedMaterials.length} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} orientation={orientation}>
                <div className="space-y-0.5">
                    {materials.map(material => (
                        <label key={material} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                            <Checkbox
                                checked={selectedMaterials.includes(material)}
                                onCheckedChange={() => onToggleMaterial(material)}
                            />
                            {material}
                        </label>
                    ))}
                </div>
            </FilterDropdown>

            <FilterDropdown id="colors" label="Color" count={selectedColors.length} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} orientation={orientation}>
                <div className="space-y-0.5">
                    {colors.map(color => (
                        <label key={color} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                            <Checkbox
                                checked={selectedColors.includes(color)}
                                onCheckedChange={() => onToggleColor(color)}
                            />
                            {color}
                        </label>
                    ))}
                </div>
            </FilterDropdown>

            <FilterDropdown id="price" label="Price" count={(priceMin || priceMax) ? 1 : 0} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} orientation={orientation}>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={priceMin}
                            onChange={e => onPriceMinChange(e.target.value)}
                            className="h-8 text-sm"
                        />
                        <span className="text-muted-foreground text-xs">to</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            value={priceMax}
                            onChange={e => onPriceMaxChange(e.target.value)}
                            className="h-8 text-sm"
                        />
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setOpenDropdown(null); onPriceApply(); }} className="w-full">
                        Apply
                    </Button>
                </div>
            </FilterDropdown>

            <Select value={sort} onValueChange={onSortChange}>
                <SelectTrigger className={`h-9 text-sm ${isVertical ? 'w-full' : 'w-[130px]'}`}>
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={onClearFilters} className={`gap-1 text-muted-foreground ${isVertical ? 'w-full justify-center' : ''}`}>
                    <X className="size-3.5" />
                    Clear
                </Button>
            )}
        </div>
    );
});

export default function CatalogIndex({ products, categories, materials, colors, filters }: Props) {
    const {
        search, setSearch,
        priceMin, setPriceMin,
        priceMax, setPriceMax,
        selectedCategories, setSelectedCategories,
        selectedMaterials, setSelectedMaterials,
        selectedColors, setSelectedColors,
        sort, setSort,
        navigate,
    } = useCatalogFilters(filters);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.categories?.length) count++;
        if (filters.materials?.length) count++;
        if (filters.colors?.length) count++;
        if (filters.price_min) count++;
        if (filters.price_max) count++;
        if (filters.sort && filters.sort !== 'latest') count++;
        return count;
    }, [filters]);

    function toggleCategory(slug: string) {
        const next = selectedCategories.includes(slug)
            ? selectedCategories.filter(s => s !== slug)
            : [...selectedCategories, slug];
        setSelectedCategories(next);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (next.length) params.categories = next.join(',');
        if (selectedMaterials.length) params.materials = selectedMaterials.join(',');
        if (selectedColors.length) params.colors = selectedColors.join(',');
        if (priceMin) params.price_min = priceMin;
        if (priceMax) params.price_max = priceMax;
        if (sort && sort !== 'latest') params.sort = sort;
        router.get(catalogIndex().url, params, { preserveState: true, preserveScroll: true });
    }

    function toggleMaterial(material: string) {
        const next = selectedMaterials.includes(material)
            ? selectedMaterials.filter(m => m !== material)
            : [...selectedMaterials, material];
        setSelectedMaterials(next);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (selectedCategories.length) params.categories = selectedCategories.join(',');
        if (next.length) params.materials = next.join(',');
        if (selectedColors.length) params.colors = selectedColors.join(',');
        if (priceMin) params.price_min = priceMin;
        if (priceMax) params.price_max = priceMax;
        if (sort && sort !== 'latest') params.sort = sort;
        router.get(catalogIndex().url, params, { preserveState: true, preserveScroll: true });
    }

    function toggleColor(color: string) {
        const next = selectedColors.includes(color)
            ? selectedColors.filter(c => c !== color)
            : [...selectedColors, color];
        setSelectedColors(next);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (selectedCategories.length) params.categories = selectedCategories.join(',');
        if (selectedMaterials.length) params.materials = selectedMaterials.join(',');
        if (next.length) params.colors = next.join(',');
        if (priceMin) params.price_min = priceMin;
        if (priceMax) params.price_max = priceMax;
        if (sort && sort !== 'latest') params.sort = sort;
        router.get(catalogIndex().url, params, { preserveState: true, preserveScroll: true });
    }

    function handleSortChange(value: string) {
        setSort(value);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (selectedCategories.length) params.categories = selectedCategories.join(',');
        if (selectedMaterials.length) params.materials = selectedMaterials.join(',');
        if (selectedColors.length) params.colors = selectedColors.join(',');
        if (priceMin) params.price_min = priceMin;
        if (priceMax) params.price_max = priceMax;
        if (value && value !== 'latest') params.sort = value;
        router.get(catalogIndex().url, params, { preserveState: true, preserveScroll: true });
    }

    function handlePriceApply() {
        navigate();
    }

    function clearFilters() {
        setSearch('');
        setSelectedCategories([]);
        setSelectedMaterials([]);
        setSelectedColors([]);
        setPriceMin('');
        setPriceMax('');
        setSort('latest');
        router.get(catalogIndex().url, {}, { preserveState: true, preserveScroll: true });
    }

    function removeFilter(key: string, value?: string) {
        let s = search;
        let cat = selectedCategories;
        let mat = selectedMaterials;
        let col = selectedColors;
        let pMin = priceMin;
        let pMax = priceMax;
        let srt = sort;

        if (key === 'search') { s = ''; }
        else if (key === 'categories' && value) { cat = cat.filter(x => x !== value); }
        else if (key === 'materials' && value) { mat = mat.filter(x => x !== value); }
        else if (key === 'colors' && value) { col = col.filter(x => x !== value); }
        else if (key === 'price') { pMin = ''; pMax = ''; }
        else if (key === 'sort') { srt = 'latest'; }

        if (key === 'search') setSearch(s);
        else if (key === 'categories' && value) setSelectedCategories(cat);
        else if (key === 'materials' && value) setSelectedMaterials(mat);
        else if (key === 'colors' && value) setSelectedColors(col);
        else if (key === 'price') { setPriceMin(''); setPriceMax(''); }
        else if (key === 'sort') setSort('latest');

        const params: Record<string, string> = {};
        if (s) params.search = s;
        if (cat.length) params.categories = cat.join(',');
        if (mat.length) params.materials = mat.join(',');
        if (col.length) params.colors = col.join(',');
        if (pMin) params.price_min = pMin;
        if (pMax) params.price_max = pMax;
        if (srt && srt !== 'latest') params.sort = srt;
        router.get(catalogIndex().url, params, { preserveState: true, preserveScroll: true });
    }

    function hasActiveFilters() {
        return activeFilterCount > 0;
    }

    function handleDebouncedSearch(value: string) {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (value) params.search = value;
            if (selectedCategories.length) params.categories = selectedCategories.join(',');
            if (selectedMaterials.length) params.materials = selectedMaterials.join(',');
            if (selectedColors.length) params.colors = selectedColors.join(',');
            if (priceMin) params.price_min = priceMin;
            if (priceMax) params.price_max = priceMax;
            if (sort && sort !== 'latest') params.sort = sort;
            router.get(catalogIndex().url, params, { preserveState: true, preserveScroll: true });
        }, 300);
    }

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <Head title="Catalog — Lumaro Furniture Studio">
                <meta name="description" content={`Browse Lumaro Furniture Studio handcrafted collection — ${products.total} products available in rich brown and neutral tones.`} />
            </Head>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Studio Catalog</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {products.from}–{products.to} of {products.total} products
                        </p>
                    </div>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                                <SlidersHorizontal className="size-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-1 px-1.5 text-xs">{activeFilterCount}</Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6">
                                <FilterBar
                                    search={search} onSearchChange={handleDebouncedSearch} onClearSearch={() => removeFilter('search')}
                                    selectedCategories={selectedCategories} selectedMaterials={selectedMaterials} selectedColors={selectedColors}
                                    priceMin={priceMin} onPriceMinChange={setPriceMin} priceMax={priceMax} onPriceMaxChange={setPriceMax} sort={sort}
                                    onToggleCategory={toggleCategory} onToggleMaterial={toggleMaterial} onToggleColor={toggleColor}
                                    onSortChange={handleSortChange} onClearFilters={clearFilters} onPriceApply={handlePriceApply}
                                    hasActiveFilters={hasActiveFilters()}
                                    categories={categories} materials={materials} colors={colors}
                                    openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={dropdownRef}
                                    orientation="vertical"
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {hasActiveFilters() && (
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">Active filters:</span>
                        {filters.search && (
                            <Badge variant="secondary" className="gap-1 pr-1">
                                "{filters.search}"
                                <button onClick={() => removeFilter('search')} className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20">
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        )}
                        {filters.categories?.map(cat => (
                            <Badge key={cat} variant="secondary" className="gap-1 pr-1">
                                {cat}
                                <button onClick={() => removeFilter('categories', cat)} className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20">
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        ))}
                        {filters.materials?.map(mat => (
                            <Badge key={mat} variant="secondary" className="gap-1 pr-1">
                                {mat}
                                <button onClick={() => removeFilter('materials', mat)} className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20">
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        ))}
                        {filters.colors?.map(col => (
                            <Badge key={col} variant="secondary" className="gap-1 pr-1">
                                {col}
                                <button onClick={() => removeFilter('colors', col)} className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20">
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        ))}
                        {(filters.price_min || filters.price_max) && (
                            <Badge variant="secondary" className="gap-1 pr-1">
                                R{filters.price_min || '0'} – R{filters.price_max || '∞'}
                                <button onClick={() => removeFilter('price')} className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20">
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        )}
                        {filters.sort && filters.sort !== 'latest' && (
                            <Badge variant="secondary" className="gap-1 pr-1 capitalize">
                                {filters.sort.replace('_', ' ')}
                                <button onClick={() => removeFilter('sort')} className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20">
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                )}

                <div className="mb-6 rounded-xl border bg-card p-4">
                    <FilterBar
                        search={search} onSearchChange={handleDebouncedSearch} onClearSearch={() => removeFilter('search')}
                        selectedCategories={selectedCategories} selectedMaterials={selectedMaterials} selectedColors={selectedColors}
                        priceMin={priceMin} onPriceMinChange={setPriceMin} priceMax={priceMax} onPriceMaxChange={setPriceMax} sort={sort}
                        onToggleCategory={toggleCategory} onToggleMaterial={toggleMaterial} onToggleColor={toggleColor}
                        onSortChange={handleSortChange} onClearFilters={clearFilters} onPriceApply={handlePriceApply}
                        hasActiveFilters={hasActiveFilters()}
                        categories={categories} materials={materials} colors={colors}
                        openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={dropdownRef}
                        orientation="horizontal"
                    />
                </div>

                {products.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.data.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {products.last_page > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-1">
                                {products.links.map((link, i) => {
                                    if (link.url === null) {
                                        if (link.label.includes('Previous') || link.label.includes('Next')) {
                                            return (
                                                <span
                                                    key={i}
                                                    className="text-muted-foreground/50 flex size-9 items-center justify-center rounded-md text-sm"
                                                >
                                                    {link.label.includes('Previous') ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                                                </span>
                                            );
                                        }
                                        return (
                                            <span
                                                key={i}
                                                className="text-muted-foreground flex size-9 items-center justify-center rounded-md text-sm"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-amber-900 text-stone-50 dark:bg-amber-800'
                                                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                                            }`}
                                            preserveState
                                            preserveScroll
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
                            <Search className="text-muted-foreground size-7" />
                        </div>
                        <h3 className="text-lg font-semibold">No products found</h3>
                        <p className="text-muted-foreground mt-1.5 text-sm max-w-sm">
                            We couldn't find any products matching your criteria. Try adjusting your search or filters.
                        </p>
                        {hasActiveFilters() && (
                            <Button variant="outline" onClick={clearFilters} className="mt-6">
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}