import { useState } from "react";
import JSZip from "jszip";
import { Download, Folder, File as FileIcon, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameAsset } from "@/lib/games-data";
import { formatBytes } from "@/lib/game-media";

function groupByFolder(assets: GameAsset[]): Map<string, GameAsset[]> {
  const m = new Map<string, GameAsset[]>();
  for (const a of assets) {
    const k = a.folder || "";
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(a);
  }
  return m;
}

async function downloadOne(a: GameAsset) {
  const res = await fetch(a.url);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = a.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

async function downloadZip(items: GameAsset[], filename: string) {
  const zip = new JSZip();
  await Promise.all(
    items.map(async (a) => {
      const res = await fetch(a.url);
      const blob = await res.blob();
      const path = a.folder ? `${a.folder}/${a.name}` : a.name;
      zip.file(path, blob);
    }),
  );
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function GameAssetsBrowser({
  assets,
  gameSlug,
}: {
  assets?: GameAsset[];
  gameSlug: string;
}) {
  const list = assets ?? [];
  const [busy, setBusy] = useState<string | null>(null);

  if (list.length === 0) return null;
  const groups = groupByFolder(list);
  const totalSize = list.reduce((acc, a) => acc + (a.size ?? 0), 0);

  const downloadAll = async () => {
    setBusy("__all__");
    try {
      await downloadZip(list, `${gameSlug}-assets.zip`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Package className="size-4" /> Downloads ({list.length} arquivo(s){totalSize ? ` · ${formatBytes(totalSize)}` : ""})
        </h3>
        <Button size="sm" variant="outline" onClick={() => void downloadAll()} disabled={busy !== null}>
          {busy === "__all__" ? <Loader2 className="!size-3.5 animate-spin" /> : <Download className="!size-3.5" />}
          Baixar tudo (.zip)
        </Button>
      </div>

      <div className="space-y-3">
        {[...groups.entries()].map(([folder, items]) => {
          const key = folder || "(root)";
          const folderLabel = folder || "Arquivos avulsos";
          return (
            <div key={key} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2.5 text-sm">
                <Folder className="size-4 text-muted-foreground" />
                <span className="font-bold">{folderLabel}</span>
                <span className="text-xs text-muted-foreground">· {items.length} arquivo(s)</span>
                {folder && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto"
                    disabled={busy !== null}
                    onClick={async () => {
                      setBusy(key);
                      try {
                        await downloadZip(items, `${gameSlug}-${folder.replace(/\//g, "-")}.zip`);
                      } finally {
                        setBusy(null);
                      }
                    }}
                  >
                    {busy === key ? <Loader2 className="!size-3.5 animate-spin" /> : <Download className="!size-3.5" />}
                    Baixar pasta
                  </Button>
                )}
              </div>
              <ul className="divide-y divide-border">
                {items.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                    <FileIcon className="size-3.5 text-muted-foreground" />
                    <span className="truncate">{a.name}</span>
                    <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                      {formatBytes(a.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void downloadOne(a)}
                      aria-label={`Baixar ${a.name}`}
                    >
                      <Download className="!size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}