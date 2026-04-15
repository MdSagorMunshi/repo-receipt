"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { parseRepoUrl } from "@/lib/transform";

interface UrlInputFormProps {
  initialValue?: string;
  buttonLabel?: string;
  compact?: boolean;
}

export function UrlInputForm({
  initialValue = "",
  buttonLabel = "Print Receipt →",
  compact = false,
}: UrlInputFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseRepoUrl(value);

    if (!parsed) {
      setError("Enter a valid GitHub repo URL or owner/repo.");
      return;
    }

    setError("");
    const target = `/r/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
    startTransition(() => {
      router.push(target);
      router.refresh();
    });
  }

  return (
    <form
      className={`flex w-full flex-col ${compact ? "gap-3" : "gap-4 md:flex-row md:items-end"}`}
      onSubmit={handleSubmit}
    >
      <div className="flex-1">
        <label
          htmlFor="repo-input"
          className="mb-2 block font-body text-sm tracking-[0.03em] text-[var(--text-muted)]"
        >
          Public GitHub repository
        </label>
        <input
          id="repo-input"
          className="mono-input"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="github.com/owner/repo"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
        />
        {error ? (
          <p className="mt-3 font-mono text-xs text-[var(--cr-danger)]">{error}</p>
        ) : null}
      </div>
      <button type="submit" className="fine-button px-5">
        {buttonLabel}
      </button>
    </form>
  );
}
