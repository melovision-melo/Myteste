import React, { useState } from 'react';
import { Link2, Copy, Check, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, ShortLink } from '../types';
import { createShortLink } from '../services/linkService';

interface CreateLinkFormProps {
  user: UserProfile;
  onLinkCreated?: (newLink: ShortLink) => void;
}

export const CreateLinkForm: React.FC<CreateLinkFormProps> = ({ user, onLinkCreated }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<ShortLink | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Por favor, insira a URL original que deseja encurtar.');
      return;
    }

    setLoading(true);
    try {
      const newLink = await createShortLink(trimmed, user, title);
      setCreatedLink(newLink);
      setUrl('');
      setTitle('');
      
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#4D7C0F', '#A3E635', '#65A30D', '#0B132B'],
        });
      } catch (e) {
        // Safe ignore
      }

      if (onLinkCreated) {
        onLinkCreated(newLink);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao criar o link encurtado no Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#101A36] rounded-2xl shadow-xl border border-[#1C2B54] p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635]" />
            <span>Encurtar Novo Link</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Gera automaticamente o identificador obrigatório <code className="font-mono text-[#A3E635] font-bold bg-[#162710] border border-[#2D4A1C] px-1.5 py-0.5 rounded">melovisionXXXX</code>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Main URL Input */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold uppercase text-[#94A3B8] mb-2">
              URL Original de Destino
            </label>
            <input
              id="input-original-url"
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/gabrielmelo/portfolio-2024-v2"
              className="w-full px-4 py-3 bg-[#090F24] border border-[#1C2B54] rounded-xl text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] focus:border-[#4D7C0F] transition"
            />
          </div>

          {/* Optional Title */}
          <div className="w-full md:w-64">
            <label className="block text-xs font-bold uppercase text-[#94A3B8] mb-2">
              Título / Rótulo (Opcional)
            </label>
            <input
              id="input-link-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Portfolio 2024"
              className="w-full px-4 py-3 bg-[#090F24] border border-[#1C2B54] rounded-xl text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] focus:border-[#4D7C0F] transition"
            />
          </div>

          {/* Action Button */}
          <button
            id="btn-create-short-link"
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-[#4D7C0F] hover:bg-[#3F6212] active:bg-[#365314] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#4D7C0F]/20 transition disabled:opacity-60 shrink-0 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <span>Encurtar Link</span>
            )}
          </button>
        </div>
      </form>

      {/* Success Notification Box */}
      {createdLink && (
        <div className="mt-5 rounded-xl border border-[#365314] bg-[#162710] p-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#1E3014] border border-[#365314] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#A3E635]">
                  Link Gerado
                </span>
                <span className="font-mono text-sm font-bold text-[#A3E635]">
                  {createdLink.slug}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] truncate">
                Link curto: <a href={createdLink.shortUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-[#A3E635] underline">{createdLink.shortUrl}</a>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-copy-new-link"
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  copied
                    ? 'bg-[#4D7C0F] text-white'
                    : 'bg-[#101A36] text-[#A3E635] border border-[#1C2B54] hover:bg-[#142347]'
                }`}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <a
                href={createdLink.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-[#1E3014] border border-[#365314] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#A3E635] hover:bg-[#28411B] transition"
              >
                <span>Testar</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
