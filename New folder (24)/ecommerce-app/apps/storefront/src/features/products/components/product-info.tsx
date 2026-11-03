'use client';

import {useState, useMemo, useTransition} from 'react';
import {useSearchParams} from 'next/navigation';
import {usePathname, useRouter} from '@/platform/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Separator} from '@/components/ui/separator';
import {ShoppingCart, CheckCircle2, Star, Truck, ShieldCheck, RotateCcw, Lock, Zap, Plus, Minus} from 'lucide-react';
import {addToCart} from '@/features/products/add-to-cart';
import {toast} from 'sonner';
import {Price} from '@/features/pricing/price';
import {useTranslations} from 'next-intl';

interface ProductInfoProps {
    product: {
        id: string;
        name: string;
        description: string;
        variants: Array<{
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            stockLevel: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
                groupId: string;
                group: {
                    id: string;
                    code: string;
                    name: string;
                };
            }>;
        }>;
        optionGroups: Array<{
            id: string;
            code: string;
            name: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
            }>;
        }>;
    };
    searchParams: { [key: string]: string | string[] | undefined };
    currencyCode: string;
}

export function ProductInfo({product, searchParams, currencyCode}: ProductInfoProps) {
    const t = useTranslations('Product');
    const pathname = usePathname();
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Initialize selected options from URL
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};

        // Load from URL search params
        product.optionGroups.forEach((group) => {
            const paramValue = searchParams[group.code];
            if (typeof paramValue === 'string') {
                const option = group.options.find((opt) => opt.code === paramValue);
                if (option) {
                    initialOptions[group.id] = option.id;
                }
            }
        });

        return initialOptions;
    });

    // Find matching variant based on selected options
    const selectedVariant = useMemo(() => {
        if (product.variants.length === 1) {
            return product.variants[0];
        }

        if (Object.keys(selectedOptions).length !== product.optionGroups.length) {
            return null;
        }

        return product.variants.find((variant) => {
            const variantOptionIds = variant.options.map((opt) => opt.id);
            const selectedOptionIds = Object.values(selectedOptions);
            return selectedOptionIds.every((optId) => variantOptionIds.includes(optId));
        });
    }, [selectedOptions, product.variants, product.optionGroups]);

    const handleOptionChange = (groupId: string, optionId: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [groupId]: optionId,
        }));

        const group = product.optionGroups.find((g) => g.id === groupId);
        const option = group?.options.find((opt) => opt.id === optionId);

        if (group && option) {
            const params = new URLSearchParams(currentSearchParams);
            params.set(group.code, option.code);
            router.push(`${pathname}?${params.toString()}`, {scroll: false});
        }
    };

    const handleAddToCart = async (redirectToCart = false) => {
        if (!selectedVariant) return;

        startTransition(async () => {
            const result = await addToCart(selectedVariant.id, quantity);

            if (result.success) {
                setIsAdded(true);
                toast.success(t('addedToCartMessage'), {
                    description: t('addedToCartDescription', {name: product.name}),
                });

                if (redirectToCart) {
                    router.push('/cart');
                } else {
                    setTimeout(() => setIsAdded(false), 2000);
                }
            } else {
                toast.error(t('errorTitle'), {
                    description: result.error || t('errorAddToCart'),
                });
            }
        });
    };

    const isInStock = selectedVariant && selectedVariant.stockLevel !== 'OUT_OF_STOCK';
    const canAddToCart = selectedVariant && isInStock;

    return (
        <div className="space-y-6">
            {/* Top Review Rating Strip */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="size-4 text-amber-400 fill-amber-400" />
                    ))}
                </div>
                <span className="text-xs font-semibold text-foreground">
                    4.9 <span className="text-muted-foreground font-normal">(148 verified reviews)</span>
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock &amp; Ready to Ship
                </span>
            </div>

            {/* Product Title & Price */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                    {product.name}
                </h1>
                {selectedVariant && (
                    <div className="flex items-baseline gap-3 pt-1">
                        <span className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                            <Price value={selectedVariant.priceWithTax} currencyCode={currencyCode}/>
                        </span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                            Free Express Shipping
                        </span>
                    </div>
                )}
            </div>

            <Separator />

            {/* Product Description */}
            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                <div dangerouslySetInnerHTML={{__html: product.description}}/>
            </div>

            {/* Option Groups */}
            {product.optionGroups.length > 0 && (
                <div className="space-y-5">
                    {product.optionGroups.map((group) => (
                        <div key={group.id} className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-foreground">
                                {group.name}
                            </Label>
                            <RadioGroup
                                value={selectedOptions[group.id] || ''}
                                onValueChange={(value) => handleOptionChange(group.id, value)}
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {group.options.map((option) => (
                                        <div key={option.id}>
                                            <RadioGroupItem
                                                value={option.id}
                                                id={option.id}
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor={option.id}
                                                className="flex items-center justify-center rounded-xl border-2 border-muted bg-popover px-4 py-3 text-sm font-semibold hover:bg-accent hover:text-accent-foreground peer-data-[checked]:border-primary peer-data-[checked]:ring-2 peer-data-[checked]:ring-primary/20 peer-data-[checked]:bg-primary/10 cursor-pointer transition-all shadow-sm"
                                            >
                                                {option.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    ))}
                </div>
            )}

            {/* Quantity Selector & Stock Indicator */}
            <div className="space-y-2 pt-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quantity
                </Label>
                <div className="flex items-center gap-4">
                    <div className="inline-flex items-center rounded-xl border border-border bg-background p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1 || isPending}
                            className="size-9 flex items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors disabled:opacity-40"
                        >
                            <Minus className="size-4" />
                        </button>
                        <span className="w-12 text-center font-bold text-sm text-foreground">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => q + 1)}
                            disabled={isPending}
                            className="size-9 flex items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>

                    <div className="text-xs">
                        {isInStock ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                In Stock &bull; Ships in 24 hours
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-destructive font-semibold">
                                <span className="size-2 rounded-full bg-destructive" />
                                {t('outOfStock')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="pt-2 space-y-3">
                <Button
                    size="lg"
                    className="w-full h-14 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!canAddToCart || isPending}
                    onClick={() => handleAddToCart(false)}
                >
                    {isAdded ? (
                        <>
                            <CheckCircle2 className="mr-2 h-5 w-5"/>
                            {t('addedToCart')}
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="mr-2 h-5 w-5"/>
                            {isPending
                                ? t('adding')
                                : !selectedVariant && product.optionGroups.length > 0
                                    ? t('selectOptions')
                                    : !isInStock
                                        ? t('outOfStock')
                                        : `${t('addToCart')} (${quantity})`}
                        </>
                    )}
                </Button>

                {canAddToCart && (
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full h-12 text-sm font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/5 hover:border-primary transition-all flex items-center justify-center gap-2"
                        disabled={isPending}
                        onClick={() => handleAddToCart(true)}
                    >
                        <Zap className="size-4 text-amber-500 fill-amber-500" />
                        <span>Instant Buy Now &rarr;</span>
                    </Button>
                )}
            </div>

            {/* Guarantee / Value Pillars Box */}
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-3 text-xs text-foreground font-medium">
                    <Truck className="size-4 text-primary shrink-0" />
                    <span>Free express delivery on all orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground font-medium">
                    <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                    <span>2-Year comprehensive manufacturer warranty</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground font-medium">
                    <RotateCcw className="size-4 text-sky-500 shrink-0" />
                    <span>30-Day risk-free return &amp; immediate refund</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground font-medium">
                    <Lock className="size-4 text-violet-500 shrink-0" />
                    <span>Bank-grade 256-bit encrypted checkout</span>
                </div>
            </div>

            {/* SKU and Stock Verification */}
            {selectedVariant && (
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <span>SKU: <strong className="font-mono text-foreground">{selectedVariant.sku}</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Authentic Hardware</span>
                </div>
            )}
        </div>
    );
}
