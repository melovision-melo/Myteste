import React, { useEffect, useState } from 'react';
import { Link2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { getLinkBySlug, trackLinkVisit } from '../services/linkService';
import { ShortLink } from '../types';

interface RedirectScreenProps {
  slug: string;
  onGoHome: () => void;
}

export const RedirectScreen: React.FC<RedirectScreenProps> = ({ slug, onGoHome }) => {
  const [link, setLink] = useState<ShortLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    let isMounted = true;

    async function handleLookupAndRedirect() {
      try {
        const found = await getLinkBySlug(slug);
        if (!isMounted) return;

        if (found) {
          setLink(found);
          // Track click in Firestore
          trackLinkVisit(found.id || found.slug).catch(console.error);

          // Perform redirect after short delay for security/preview feedback
          let counter = 2;
          const timer = setInterval(() => {
            counter -= 1;
            if (isMounted) setCountdown(counter);
            if (counter <= 0) {
              clearInterval(timer);
              // Perform safe redirection
              window.location.href = found.originalUrl;
            }
          }, 800);

          return () => clearInterval(timer);
        } else {
          setError(`Nenhum link encontrado para o identificador "${slug}".`);
        }
      } catch (err: any) {
        console.error('Redirect lookup error:', err);
        if (isMounted) {
          setError(err.message || 'Erro ao consultar o link no banco de dados.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    handleLookupAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleImmediateRedirect = () => {
    if (link?.originalUrl) {
      window.location.href = link.originalUrl;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A1128] px-4 text-center text-[#F8FAFC]">
      <div className="w-full max-w-md rounded-2xl border border-[#1C2B54] bg-[#101A36] p-8 shadow-2xl">
        
        {/* Logo */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E3014] text-[#A3E635] border border-[#365314] shadow-lg">
          <Link2 className="h-7 w-7 stroke-[2.5]" />
        </div>

        <h1 className="text-xl font-bold text-white">
          MeloVision Redirecionamento
        </h1>
        
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#162710] px-3 py-1 font-mono text-xs font-bold text-[#A3E635] border border-[#2D4A1C]">
          <span>{slug}</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-8 space-y-3">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#4D7C0F] border-t-[#A3E635]" />
            <p className="text-xs text-[#94A3B8]">
              Buscando URL de destino no Firestore...
            </p>
          </div>
        )}

        {/* Redirecting State */}
        {!loading && link && (
          <div className="mt-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#A3E635]">
              <ShieldCheck className="h-4 w-4" />
              <span>Link verificado e seguro</span>
            </div>

            <div className="rounded-xl bg-[#090F24] p-4 border border-[#1C2B54] text-left">
              <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold block">
                Destino:
              </span>
              <p className="mt-0.5 font-medium text-xs text-white break-all">
                {link.originalUrl}
              </p>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Redirecionando em <strong className="text-[#A3E635]">{countdown}s</strong>...
            </p>

            <button
              id="btn-redirect-now"
              onClick={handleImmediateRedirect}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4D7C0F] hover:bg-[#3F6212] active:bg-[#365314] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#4D7C0F]/20 transition"
            >
              <span>Acessar Destino</span>
              <ArrowRight className="h-4 w-4 text-[#A3E635]" />
            </button>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="mt-6 space-y-4 animate-in fade-in">
            <div className="rounded-xl border border-red-800/60 bg-red-950/40 p-4 text-xs text-red-300 flex items-start gap-2 text-left">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Verifique se o link foi digitado corretamente ou se foi removido pelo proprietário.
            </p>

            <button
              id="btn-back-home"
              onClick={onGoHome}
              className="w-full rounded-xl bg-[#1E3014] border border-[#365314] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#A3E635] hover:bg-[#28411B] transition"
            >
              Ir para o Painel
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
