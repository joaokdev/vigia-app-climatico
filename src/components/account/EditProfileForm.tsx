"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function EditProfileForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const name = String(new FormData(e.currentTarget).get("name") ?? "");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error?.message ?? "Não foi possível salvar.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
        Editar perfil
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-end gap-2">
      <div className="flex-1">
        <Input label="Nome" name="name" defaultValue={currentName} required />
      </div>
      <Button type="submit" size="sm" loading={saving}>
        Salvar
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
        Cancelar
      </Button>
      {error && <p className="text-xs text-[color:var(--color-danger)]">{error}</p>}
    </form>
  );
}
