"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const CHANNELS = [
  { id: "social", label: "Social" },
  { id: "edm", label: "EDM" },
  { id: "pdp", label: "Product Description" },
];

const NAV = [
  {
    group: "Generate",
    items: CHANNELS.map((c) => ({
      label: c.label,
      href: `/generate/${c.id}`,
    })),
  },
  {
    group: "More",
    items: [{ label: "History", href: "/history" }],
  },
];

interface ShopifyStatus {
  authenticated: boolean;
  expired?: boolean;
  expiresAt?: string;
  productCount: number;
  lastSyncedAt: string | null;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [shopifyAuth, setShopifyAuth] = useState<ShopifyStatus | null>(null);

  function loadStatus() {
    fetch("/api/shopify/status")
      .then((r) => r.json())
      .then(setShopifyAuth)
      .catch(() => setShopifyAuth({ authenticated: false, productCount: 0, lastSyncedAt: null }));
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function syncProducts() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/products/sync", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setSyncMsg(`${json.data.synced} products synced`);
        loadStatus();
      } else {
        setSyncMsg(json.error || "Sync failed");
      }
    } catch {
      setSyncMsg("Sync failed");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 4000);
    }
  }

  const hasProducts = shopifyAuth && shopifyAuth.productCount > 0;

  return (
    <aside className="w-52 shrink-0 flex flex-col min-h-screen bg-[#323250]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-white text-sm font-semibold tracking-wide">memobottle</span>
        <p className="text-white/40 text-xs mt-0.5">copy generator</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.group}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                        active
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/60 hover:text-white/90 hover:bg-white/5"
                      }`}
                    >
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ADDADF] shrink-0" />
                      )}
                      {!active && <span className="w-1.5 h-1.5 shrink-0" />}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        {/* Product catalogue status */}
        {hasProducts && (
          <div className="space-y-0.5">
            <p className="text-xs text-white/50">
              {shopifyAuth!.productCount} products
            </p>
            {shopifyAuth!.lastSyncedAt && (
              <p className="text-[10px] text-white/25">
                Synced {timeAgo(shopifyAuth!.lastSyncedAt)}
              </p>
            )}
          </div>
        )}

        {/* Auth / sync action */}
        {shopifyAuth?.authenticated ? (
          <button
            onClick={syncProducts}
            disabled={syncing}
            className="text-xs text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync products"}
          </button>
        ) : (
          <div className="space-y-1">
            <a
              href="/api/shopify/auth"
              className="block text-xs text-[#FFB466] hover:text-white transition-colors"
            >
              {shopifyAuth?.expired ? "Re-authenticate Shopify" : "Authenticate Shopify"}
            </a>
            {hasProducts && (
              <p className="text-[10px] text-white/25">Products loaded from last sync</p>
            )}
          </div>
        )}

        {syncMsg && <p className="text-xs text-[#ADDADF]">{syncMsg}</p>}

        <p className="text-xs text-white/20">
          {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        <p className="text-[10px] text-white/15">v1.0</p>
      </div>
    </aside>
  );
}
