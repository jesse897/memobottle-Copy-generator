"use client";

import { useEffect, useState, useRef } from "react";
import { Product, ShopifyCollection } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/productCategories";

interface Props {
  value: string;
  onChange: (productId: string, product: Product | null) => void;
  required?: boolean;
  label?: string;
}

export default function ProductSelector({ value, onChange, required = true, label = "Product" }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/collections").then((r) => r.json()),
    ]).then(([productsJson, collectionsJson]) => {
      if (productsJson.data) setProducts(productsJson.data);
      if (collectionsJson.data) setCollections(collectionsJson.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Whitelisted Shopify collection titles → display names
  const COLLECTION_WHITELIST: Record<string, string> = {
    "memobottle™": "OG memobottle",
    "Stainless Steel memobottle™": "Stainless Steel memobottle",
    "Coloured Bundles": "Coloured Bundles",
    "A3 Daily Bag": "A3 Daily Tote",
    "Sleeves": "Silicone Sleeves",
    "Lids": "Lids",
    "Desk Stands": "Desk Stands",
  };

  // Use DB collections if synced, otherwise fall back to static categories
  const useDbCollections = collections.length > 0;
  const collectionItems = useDbCollections
    ? collections
        .filter((c) => c.title in COLLECTION_WHITELIST)
        .map((c) => ({ id: `collection:${c.shopifyId}`, title: COLLECTION_WHITELIST[c.title] }))
        .sort((a, b) => {
          const order = Object.values(COLLECTION_WHITELIST);
          return order.indexOf(a.title) - order.indexOf(b.title);
        })
    : PRODUCT_CATEGORIES.map((c) => ({ id: c.id, title: c.title }));

  // Find selected label
  const selectedCollection = collectionItems.find((c) => c.id === value);
  const selectedProduct = products.find((p) => p.id === value);
  const selectedLabel = selectedCollection?.title ?? selectedProduct?.title ?? null;

  const lowerQuery = query.toLowerCase();

  const filteredCollections = collectionItems.filter(
    (c) => !query || c.title.toLowerCase().includes(lowerQuery)
  );

  const filteredProducts = products.filter(
    (p) => !query || p.title.toLowerCase().includes(lowerQuery)
  );

  // Group synced products by productType
  const grouped: Record<string, Product[]> = {};
  for (const p of filteredProducts) {
    const type = p.productType || "Other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(p);
  }

  const hasResults = filteredCollections.length > 0 || filteredProducts.length > 0;

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-[#323250] mb-1">
        {label}{required && <span className="text-[#BB3C55] ml-0.5">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 rounded border border-[#e8e6e3] bg-white text-sm text-[#3D4246] focus:outline-none focus:border-[#323250] transition-colors flex items-center justify-between"
      >
        <span className={selectedLabel ? "text-[#3D4246]" : "text-[#999]"}>
          {loading ? "Loading products..." : selectedLabel ?? "Select a product"}
        </span>
        <svg className="w-4 h-4 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded border border-[#e8e6e3] shadow-lg max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#f0eeeb]">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded border border-[#e8e6e3] focus:outline-none focus:border-[#323250]"
            />
          </div>

          <div className="overflow-y-auto">
            {!hasResults ? (
              <p className="px-3 py-3 text-sm text-[#999]">No products found.</p>
            ) : (
              <>
                {/* Collections at top */}
                {filteredCollections.length > 0 && (
                  <div>
                    <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#999]">
                      {useDbCollections ? "Collections" : "Category"}
                    </p>
                    {filteredCollections.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          onChange(col.id, null);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f5f4f2] transition-colors ${
                          col.id === value ? "text-[#323250] font-medium" : "text-[#3D4246]"
                        }`}
                      >
                        {col.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Divider */}
                {filteredCollections.length > 0 && Object.keys(grouped).length > 0 && (
                  <div className="mx-3 my-1 border-t border-[#f0eeeb]" />
                )}

                {/* Synced Shopify products grouped by type */}
                {Object.entries(grouped).map(([type, items]) => (
                  <div key={type}>
                    <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#999]">
                      {type}
                    </p>
                    {items.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onChange(p.id, p);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f5f4f2] transition-colors ${
                          p.id === value ? "text-[#323250] font-medium" : "text-[#3D4246]"
                        }`}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                ))}

                {/* Prompt to sync if no specific products loaded */}
                {products.length === 0 && !loading && (
                  <p className="px-3 py-2 text-xs text-[#bbb]">
                    Sync products to select a specific variant
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
