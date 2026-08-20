import React, { useState } from 'react';
import { X, Link2, Check, AlertCircle } from 'lucide-react';
import { ShortLink } from '../types';
import { updateShortLink } from '../services/linkService';

interface EditLinkModalProps {
  link: ShortLink;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditLinkModal: React.FC<EditLinkModalProps> = ({
  link,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [originalUrl, setOriginalUrl] = useState(link.originalUrl);
  const [title, setTitle] = useState(link.title || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = originalUrl.trim();
    if (!trimmed) {
      setError('A URL de destino não pode ficar em branco.');
      return;
    }

    setLoading(true);
    try {
      await updateShortLink(link.id, trimmed, title);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao atualizar o link no Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-[#1C2B54] bg-[#101A36] p-6 shadow-2xl text-[#F8FAFC]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2B54] pb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Editar Link de Destino
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Identificador fixo:{' '}
              <code className="font-mono font-bold text-[#A3E635] bg-[#162710] border border-[#2D4A1C] px-1.5 py-0.5 rounded">
                {link.slug}
              </code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#1C2B54] hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-[#94A3B8] mb-1.5">
              Nova URL Original de Destino
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                <Link2 className="h-4 w-4" />
              </div>
              <input
                id="input-edit-url"
                type="text"
                required
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://exemplo.com/nova-url"
                className="w-full rounded-xl border border-[#1C2B54] bg-[#090F24] py-2.5 pl-10 pr-3 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] focus:border-[#4D7C0F] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#94A3B8] mb-1.5">
              Título / Rótulo do Link
            </label>
            <input
              id="input-edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Landing Page Nova"
              className="w-full rounded-xl border border-[#1C2B54] bg-[#090F24] py-2.5 px-3 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] focus:border-[#4D7C0F] transition"
            />
          </div>

          <div className="rounded-xl bg-[#162710] border border-[#2D4A1C] p-3 text-xs text-[#94A3B8]">
            Acessos a <strong className="text-[#A3E635] font-mono">{link.shortUrl}</strong> serão redirecionados instantaneamente para a nova URL.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#1C2B54] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#94A3B8] hover:bg-[#142247] hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              id="btn-save-edit-link"
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-[#4D7C0F] hover:bg-[#3F6212] active:bg-[#365314] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#4D7C0F]/20 transition disabled:opacity-60"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Check className="h-4 w-4 text-[#A3E635]" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
