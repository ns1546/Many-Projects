'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type WishlistContextType = {
    items: string[];
    addItem: (productId: string) => void;
    removeItem: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<string[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem('vendure-wishlist');
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                // Ignore parse error
            }
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('vendure-wishlist', JSON.stringify(items));
        }
    }, [items, isMounted]);

    const addItem = (productId: string) => {
        setItems(prev => {
            if (!prev.includes(productId)) {
                return [...prev, productId];
            }
            return prev;
        });
    };

    const removeItem = (productId: string) => {
        setItems(prev => prev.filter(id => id !== productId));
    };

    const isInWishlist = (productId: string) => items.includes(productId);

    return (
        <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
