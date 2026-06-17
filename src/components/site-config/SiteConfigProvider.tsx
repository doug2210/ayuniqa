import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_SITE_CONFIG,
  SITE_CONFIG_KEY,
  loadConfig,
  saveConfig,
  resetConfig as clearStoredConfig,
  type SiteConfig,
} from "@/lib/site-config";
import { supabase, SITE_CONFIG_ROW_ID } from "@/integrations/supabase/client";

type Ctx = {
  config: SiteConfig;
  setConfig: (next: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => void;
  reset: () => void;
};

const SiteConfigContext = createContext<Ctx | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  // SSR-safe: start with defaults, hydrate from localStorage on mount.
  const [config, setConfigState] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    // 1) Hydrate from localStorage immediately (instant paint).
    setConfigState(loadConfig());

    // 2) Then fetch the canonical row from Supabase.
    supabase
      .from("site_config")
      .select("data")
      .eq("id", SITE_CONFIG_ROW_ID)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data?.data) return;
        const isEmpty =
          typeof data.data === "object" &&
          data.data !== null &&
          Object.keys(data.data as object).length === 0;
        if (isEmpty) return;
        const remote = loadConfigFromObject(data.data);
        setConfigState(remote);
        saveConfig(remote); // refresh local cache
      });

    const onStorage = (e: StorageEvent) => {
      if (e.key === SITE_CONFIG_KEY) setConfigState(loadConfig());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setConfig = useCallback((next: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => {
    setConfigState((prev) => {
      const value = typeof next === "function" ? (next as (p: SiteConfig) => SiteConfig)(prev) : next;
      saveConfig(value);
      // Best-effort persist to Supabase. Only admins will succeed (RLS); others fail silently.
      void supabase
        .from("site_config")
        .upsert({ id: SITE_CONFIG_ROW_ID, data: value as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.warn("[site_config] save failed:", error.message);
        });
      return value;
    });
  }, []);

  const reset = useCallback(() => {
    clearStoredConfig();
    setConfigState(DEFAULT_SITE_CONFIG);
    void supabase
      .from("site_config")
      .upsert({ id: SITE_CONFIG_ROW_ID, data: {} as Record<string, unknown>, updated_at: new Date().toISOString() });
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, setConfig, reset }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

function loadConfigFromObject(obj: unknown): SiteConfig {
  // Reuse the merge logic by stashing into localStorage shape via JSON.
  try {
    const json = JSON.stringify(obj);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SITE_CONFIG_KEY, json);
      return loadConfig();
    }
  } catch {
    // ignore
  }
  return DEFAULT_SITE_CONFIG;
}

export function useSiteConfig(): Ctx {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    // Fallback so components used outside the provider (e.g. early SSR) still work.
    return {
      config: DEFAULT_SITE_CONFIG,
      setConfig: () => {},
      reset: () => {},
    };
  }
  return ctx;
}