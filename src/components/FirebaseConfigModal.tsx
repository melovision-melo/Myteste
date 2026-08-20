import React, { useState } from 'react';
import { X, Flame, Check, Info } from 'lucide-react';
import {
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  isFirebaseConfigured,
  initializeFirebaseServices,
} from '../config/firebase';
import { FirebaseConfigState } from '../types';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<FirebaseConfigState>(getStoredFirebaseConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof FirebaseConfigState, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredFirebaseConfig(config);
    initializeFirebaseServices(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onConfigUpdated();
      onClose();
    }, 1200);
  };

  const isConfigured = isFirebaseConfigured(config);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#0284C7]">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Configuração do Firebase
              </h3>
              <p className="text-xs text-slate-500">
                Projeto configurado: <strong className="text-[#0284C7] font-mono">encurtadorlink</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 p-3.5 text-xs text-slate-700 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#0284C7]" />
          <div>
            Cole as credenciais do seu Web App (<code className="font-mono font-bold text-[#0284C7]">MeuEncurtador</code>) obtidas no Console do Firebase (Configurações do Projeto &gt; Seus Aplicativos &gt; SDK setup).
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              apiKey (Chave de API da Web)
            </label>
            <input
              id="input-firebase-api-key"
              type="text"
              value={config.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                projectId
              </label>
              <input
                id="input-firebase-project-id"
                type="text"
                value={config.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                placeholder="encurtadorlink"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                authDomain
              </label>
              <input
                id="input-firebase-auth-domain"
                type="text"
                value={config.authDomain}
                onChange={(e) => handleChange('authDomain', e.target.value)}
                placeholder="encurtadorlink.firebaseapp.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                storageBucket
              </label>
              <input
                id="input-firebase-storage-bucket"
                type="text"
                value={config.storageBucket}
                onChange={(e) => handleChange('storageBucket', e.target.value)}
                placeholder="encurtadorlink.appspot.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                appId
              </label>
              <input
                id="input-firebase-app-id"
                type="text"
                value={config.appId}
                onChange={(e) => handleChange('appId', e.target.value)}
                placeholder="1:180946885089:web:..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className={`h-2 w-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-slate-500 text-[11px]">
                {isConfigured ? 'Pronto para sincronizar' : 'Demonstração ativa'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition"
              >
                Fechar
              </button>

              <button
                id="btn-save-firebase-config"
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-slate-800 transition"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-[#38BDF8]" />
                    <span>Salvo!</span>
                  </>
                ) : (
                  <span>Salvar</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

