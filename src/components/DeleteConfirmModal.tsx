import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { ShortLink } from '../types';
import { deleteShortLink } from '../services/linkService';

interface DeleteConfirmModalProps {
  link: ShortLink;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  link,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteShortLink(link.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao excluir o link do Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-[#1C2B54] bg-[#101A36] p-6 shadow-2xl text-[#F8FAFC]">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/60 border border-red-800 text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#1C2B54] hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-bold text-white">
            Excluir Link Encurtado?
          </h3>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Esta ação não pode ser desfeita. O link será removido permanentemente do Firestore.
          </p>

          <div className="mt-4 rounded-xl bg-[#090F24] p-3.5 text-xs text-[#94A3B8] space-y-1 border border-[#1C2B54]">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <span>Slug:</span>
              <code className="font-mono text-[#A3E635] font-bold bg-[#162710] border border-[#2D4A1C] px-1.5 py-0.5 rounded">{link.slug}</code>
            </p>
            <p className="text-[11px] text-[#64748B] truncate">
              Destino: {link.originalUrl}
            </p>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#1C2B54] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#94A3B8] hover:bg-[#142247] hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-delete-link"
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/20 transition disabled:opacity-60"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Sim, Excluir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
