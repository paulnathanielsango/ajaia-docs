"use client";

import { useRef, useState } from "react";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { importFromFile } from "@/actions/documents";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileImportButtonProps = {
  className?: string;
};

export function FileImportButton({ className }: FileImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await importFromFile(formData);
      if (result && "error" in result) {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to import file.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="h-10 gap-2 rounded-xl border-white/12 bg-white/[0.04] px-4 text-[0.875rem] font-medium tracking-[-0.01em] text-white/85 hover:bg-white/[0.08] hover:text-foreground"
      >
        <UploadIcon className="size-4" />
        {loading ? "Importing…" : "Import file"}
      </Button>
      <span className="hidden text-[0.75rem] tracking-[-0.01em] text-white/35 sm:inline">
        .txt · .md
      </span>
    </div>
  );
}
