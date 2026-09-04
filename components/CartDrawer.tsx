"use client";

import { useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./CartContext";
import { checkShipping, isValidCep } from "@/lib/shipping";
import { buildWhatsAppLink, buildWhatsAppOrderMessage } from "@/lib/whatsapp";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } =
    useCart();
  const [cep, setCep] = useState("");

  const shipping = isValidCep(cep) ? checkShipping(cep) : null;

  function handleCheckout() {
    const message = buildWhatsAppOrderMessage(
      items,
      cep,
      shipping ?? { valid: false, freeShipping: false, regionLabel: null }
    );
    const link = buildWhatsAppLink(message);
    window.open(link, "_blank");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* fundo escurecido */}
      <button
        aria-label="Fechar carrinho"
        onClick={closeCart}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-brand-black">
            Seu carrinho
          </h2>
          <button onClick={closeCart} aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center font-body text-sm text-brand-black/60">
              Seu carrinho está vazio.
            </p>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.colorName}`}
                  className="flex gap-3 border-b border-black/5 pb-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-brand-cream">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm font-semibold text-brand-black">
                      {item.name}
                    </p>
                    <p className="font-body text-xs text-brand-black/60">
                      {item.colorName}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.colorName, item.quantity - 1)
                        }
                        className="rounded-sm border border-black/10 p-1"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center font-body text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.colorName, item.quantity + 1)
                        }
                        className="rounded-sm border border-black/10 p-1"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-body text-sm font-semibold text-brand-black">
                      {formatBRL(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId, item.colorName)}
                      aria-label="Remover item"
                      className="text-brand-black/40 hover:text-brand-orange"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-black/5 px-5 py-5">
            <label className="font-body text-xs font-medium text-brand-black/70">
              CEP de entrega
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              className="mt-1 w-full rounded-sm border border-black/15 px-3 py-2 font-body text-sm outline-none focus:border-brand-orange"
            />
            {shipping && (
              <p className="mt-2 font-body text-xs text-brand-black/70">
                {shipping.freeShipping
                  ? `Frete grátis — ${shipping.regionLabel}`
                  : "Fora de João Pessoa e Goiana: o frete é combinado com você pelo WhatsApp."}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between font-body text-sm">
              <span className="text-brand-black/70">Subtotal</span>
              <span className="font-semibold text-brand-black">
                {formatBRL(subtotal)}
              </span>
            </div>

            <button onClick={handleCheckout} className="btn-brand mt-4 w-full">
              Finalizar pedido pelo WhatsApp
            </button>
            <p className="mt-2 text-center font-body text-[11px] text-brand-black/50">
              Você será levado ao WhatsApp com o pedido já escrito.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
