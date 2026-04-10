"use client";

import { useEffect, useState, useRef } from "react";
import { ShopifyCollection } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/productCategories";

interface SimpleProduct {
  id: string;
  title: string;
}

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
}

// Whitelisted collections (same as ProductSelector)
const COLLECTION_WHITELIST: Record<string, string> = {
  "memobottle™": "OG memobottle",
  "Stainless Steel memobottle™": "Stainless Steel memobottle",
  "Coloured Bundles": "Coloured Bundles",
  "A3 Daily Bag": "A3 Daily Tote",
  "Sleeves": "Silicone Sleeves",
  "Lids": "Lids",
  "Desk Stands": "Desk Stands",
};

export default function MultiProductSelector({ value, onChange }: Props) {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
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

  const useDbCollections = collections.length > 0;
  const collectionItems: SimpleProduct[] = useDbCollections
    ? collections
        .filter((c) => c.title in COLLECTION_WHITELIST)
        .map((c) => ({ id: `collection:${c.shopifyId}`, title: COLLECTION_WHITELIST[c.title] }))
        .sort((a, b) => {
          const order = Object.values(COLLECTION_WHITELIST);
          return order.indexOf(a.title) - order.indexOf(b.title);
        })
    : PRODUCT_CATEGORIES.map((c) => ({ id: c.id, title: c.title }));

  const lowerQuery = query.toLowerCase();
  const filteredCollections = collectionItems.filter(
    (c) => !query || c.title.toLowerCase().includes(lowerQuery)
  );
  const filteredProducts = products.filter(
    (p) => !query || p.title.toLowerCase().includes(lowerQuery)
  );

  // Group products by productType
  const grouped: Record<string, SimpleProduct[]> = {};
  for (const p of filteredProducts) {
    const type = (p as any).productType || "Other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(p);
  }

  // All selectable items for label lookup
  const allItems = [...collectionItems, ...products];

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  const selectedItems = value
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean) as SimpleProduct[];

  return (
    <div>
      <label className="block text-xs font-medium text-[#323250] mb-1">
        Products
        <span className="text-[#999] font-normal ml-1">— optional, leave empty for brand emails</span>
      </label>

      {/* Chips */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#323250] text-white text-xs rounded"
            >
              {item.title}
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="ml-0.5 hover:text-[#ADDADF] transition-colors"
                aria-label={`Remove ${item.title}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full text-left px-3 py-2 rounded border border-[#e8e6e3] bg-white text-sm text-[#3D4246] focus:outline-none focus:border-[#323250] transition-colors flex items-center justify-between"
        >
          <span className="text-[#999]">
            {loading ? "Loading..." : `Add a product or collection...`}
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
              {filteredCollections.length === 0 && filteredProducts.length === 0 ? (
                <p className="px-3 py-3 text-sm text-[#999]">No products found.</p>
              ) : (
                <>
                  {filteredCollections.length > 0 && (
                    <div>
                      <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#999]">
                        {useDbCollections ? "Collections" : "Category"}
                      </p>
                      {filteredCollections.map((col) => {
                        const selected = value.includes(col.id);
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => toggle(col.id)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f5f4f2] transition-colors flex items-center justify-between ${
                              selected ? "text-[#323250] font-medium" : "text-[#3D4246]"
                            }`}
                          >
                            {col.title}
                            {selected && <span className="text-[#323250] text-xs">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {filteredCollections.length > 0 && Object.keys(grouped).length > 0 && (
                    <div className="mx-3 my-1 border-t border-[#f0eeeb]" />
                  )}

                  {Object.entries(grouped).map(([type, items]) => (
                    <div key={type}>
                      <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#999]">
                        {type}
                      </p>
                      {items.map((p) => {
                        const selected = value.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggle(p.id)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f5f4f2] transition-colors flex items-center justify-between ${
                              selected ? "text-[#323250] font-medium" : "text-[#3D4246]"
                            }`}
                          >
                            {p.title}
                            {selected && <span className="text-[#323250] text-xs">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
