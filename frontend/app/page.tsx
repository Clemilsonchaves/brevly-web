"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";

type LinkItem = {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  accessCount: number;
  createdAt: string;
};

type LinksResponse = {
  data: LinkItem[];
  cursor: number | null;
  hasMore: boolean;
};

type Feedback = {
  tone: "success" | "error";
  message: string;
};

const API_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "https://brevly-api.vercel.app"
    : process.env.NEXT_PUBLIC_API_URL || "/api";

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/health`, { method: "GET" });
        setBackendStatus(response.ok ? "online" : "offline");
      } catch {
        setBackendStatus("offline");
      }
    };

    checkHealth();
  }, []);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_URL}/links`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel carregar os links");
      }

      const payload = (await response.json()) as LinksResponse;
      setLinks(payload.data);
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao carregar links",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback({ tone: "success", message: "Link copiado para a área de transferência" });
    } catch {
      setFeedback({ tone: "error", message: "Não foi possivel copiar o link" });
    }
  }, []);

  const deleteLink = useCallback(
    async (link: LinkItem) => {
      try {
        const response = await fetch(`${API_URL}/links/${link.shortCode}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Nao foi possivel remover o link");
        }

        setFeedback({ tone: "success", message: "Link removido com sucesso" });
        await loadLinks();
      } catch (error) {
        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Erro inesperado ao remover link",
        });
      }
    },
    [loadLinks]
  );

  const exportCsv = useCallback(async () => {
    setIsExporting(true);

    try {
      const response = await fetch(`${API_URL}/links/export`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel exportar os links");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `links-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setFeedback({ tone: "success", message: "CSV exportado com sucesso" });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao exportar",
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsCreating(true);
      setFeedback(null);

      try {
        const response = await fetch(`${API_URL}/links`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            originalUrl,
            shortCode: shortCode.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(payload?.message || "Nao foi possivel criar o link");
        }

        const createdLink = (await response.json()) as LinkItem;
        setOriginalUrl(createdLink.originalUrl || "");
        setShortCode(createdLink.shortCode || "");
        setFeedback({ tone: "success", message: "Link criado com sucesso" });
        await loadLinks();
      } catch (error) {
        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Erro inesperado ao criar link",
        });
      } finally {
        setIsCreating(false);
      }
    },
    [loadLinks, originalUrl, shortCode]
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1180px] px-4 py-12 sm:px-8">
      <header className="mb-7">
        <Image src="/Logo.svg" alt="brev.ly" width={129} height={32} priority className="h-8 w-auto" />
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[380px_1fr]">
        <article className="rounded-xl border border-[#e2e4ee] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-[2rem] font-bold leading-none text-[#1f2025]">Novo link</h2>

          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <label className="text-[0.7rem] font-bold uppercase tracking-wide text-[#70737f]">Link original</label>
              <input
                type="url"
                required
                value={originalUrl}
                onChange={(event) => {
                  const value = event.target.value;
                  setOriginalUrl(value); 

                  if (value === "") {
                    setShortCode("");
                  }
                }}
                placeholder="www.exemplo.com.br"
                className="h-12 rounded-lg border border-[#d4d8e2] bg-[#f9f9fb] px-4 text-[#3f4350] outline-none transition focus:border-[#93a0db] focus:ring-2 focus:ring-[#dce1f6]"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[0.7rem] font-bold uppercase tracking-wide text-[#70737f]">Link encurtado</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-[#70737f]">
                  brev.ly/
                </span>
                <input
                  type="text"
                  value={shortCode}
                  onChange={(event) => setShortCode(event.target.value)}
                  placeholder="meu-codigo"
                  className="h-12 w-full rounded-lg border border-[#d4d8e2] bg-[#f9f9fb] pl-[4.1rem] pr-4 text-[#3f4350] outline-none transition focus:border-[#93a0db] focus:ring-2 focus:ring-[#dce1f6]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-[#2f53c8] px-4 text-base font-bold text-white transition hover:bg-[#2446b0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "Criando..." : "Salvar link"}
            </button>
          </form>
        </article>

        <section className="rounded-xl border border-[#e2e4ee] bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#ebeef4] pb-4">
          <div>
            <h2 className="text-[2rem] font-bold leading-none text-[#1f2025]">Meus links</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={isExporting}
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#e4e7f0] bg-[#f4f6fb] px-3 text-xs font-semibold text-[#8f94a6] transition hover:bg-[#edf1fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? (
                "Exportando..."
              ) : (
                <>
                  <Image src="/DownloadSimple.png" alt="" width={16} height={16} className="mr-2 h-4 w-4" />
                  <span>Baixar CSV</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={loadLinks}
              disabled={isLoading}
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#d6dae6] bg-white px-3 text-xs font-semibold text-[#646b7f] transition hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
          </div>

          <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#8f94a6]">
            {backendStatus === "checking" ? "Status: verificando" : backendStatus === "online" ? "Status: online" : "Status: offline"}
          </div>

        {feedback && (
          <p
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              feedback.tone === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </p>
        )}

        {links.length === 0 ? (
          <div className="flex h-[240px] flex-col items-center justify-center text-center text-[#8d93a6]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="mb-3 h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L11.59 5.3" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.88-1.88" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wide">Ainda não existem links cadastrados!</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {links.map((link) => {
              const publicShortUrl = `https://brev.ly/${link.shortCode}`;

              return (
                <li
                  key={link.id}
                  className="grid gap-3 rounded-xl border border-[#eceff5] bg-[#f9f9fb] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0 space-y-2">
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-semibold text-[#2f53c8] hover:underline"
                    >
                      {`brev.ly/${link.shortCode}`}
                    </a>
                  <p className="truncate text-xs text-[#707788]">{link.originalUrl}</p>
                  <p className="text-xs font-medium text-[#707788]">Acessos: {link.accessCount}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(publicShortUrl)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d6dae6] bg-white text-[#646b7f] transition hover:bg-[#f6f8fc]"
                      aria-label="Copiar link"
                      title="Copiar link"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteLink(link)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                      aria-label="Remover link"
                      title="Remover link"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        </section>
      </div>
    </main>
  );
}
