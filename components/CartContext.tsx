"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem } from "@/types/product";

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, colorName: string) => void;
  updateQuantity: (productId: string, colorName: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "otica-lider-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(newItem: CartItem) {
    setItems((current) => {
      const existing = current.find((item) => item.productId === newItem.productId && item.colorName === newItem.colorName);
      if (existing) {
        return current.map((item) => item.productId === newItem.productId && item.colorName === newItem.colorName ? { ...item, quantity: item.quantity + newItem.quantity } : item);
      }
      return [...current, newItem];
    });
  }

  function removeItem(productId: string, colorName: string) {
    setItems((current) => current.filter((item) => !(item.productId === productId && item.colorName === colorName)));
  }

  function updateQuantity(productId: string, colorName: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId, colorName);
      return;
    }
    setItems((current) => current.map((item) => item.productId === productId && item.colorName === colorName ? { ...item, quantity } : item));
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart: () => setItems([]), subtotal, totalItems }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa ser usado dentro de <CartProvider>");
  return context;
}
