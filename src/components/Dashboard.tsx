import React, { useState, useEffect } from 'react';
import {
  Link2,
  MousePointerClick,
  Activity,
  Plus,
} from 'lucide-react';
import { UserProfile, ShortLink } from '../types';
import { subscribeToUserLinks } from '../services/linkService';
import { CreateLinkForm } from './CreateLinkForm';
import { LinkList } from './LinkList';
import { EditLinkModal } from './EditLinkModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface DashboardProps {
  user: UserProfile;
  activeTab?: 'dashboard' | 'links' | 'analytics';
  onOpenConfig?: () => void;
  onOpenCodeExport?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  activeTab = 'dashboard',
}) => {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
  const [deletingLink, setDeletingLink] = useState<ShortLink | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToUserLinks(user.uid, (data) => {
      setLinks(data);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user.uid]);

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const activeLinksPercent = links.length > 0 ? '100%' : '0%';
  const topLink = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'links':
        return 'Meus Links';
      case 'analytics':
        return 'Analytics e Desempenho';
      default:
        return 'Visão Geral';
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById('input-original-url');
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0A1128] text-[#F8FAFC]">
      {/* Dark Navy Top Header Bar */}
      <header className="h-20 bg-[#080E21] border-b border-[#1C2B54] px-6 sm:px-8 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {getHeaderTitle()}
          </h1>
          <p className="text-xs text-[#94A3B8] hidden sm:block">
            Sincronização em tempo real &bull; Padrão exclusivo <code className="font-mono text-[#A3E635] font-bold bg-[#162710] border border-[#2D4A1C] px-1.5 py-0.5 rounded">melovisionXXXX</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={scrollToForm}
            className="bg-[#4D7C0F] hover:bg-[#3F6212] active:bg-[#365314] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-[#4D7C0F]/20 transition-all flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 text-[#A3E635]" />
            <span>+ Novo Link</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8 space-y-8 flex-1 overflow-auto bg-[#0A1128]">
        
        {/* 3-Column Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Card 1: Total Links */}
          <div className="bg-[#101A36] p-6 rounded-2xl shadow-xl border border-[#1C2B54] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Total de Links</p>
              <div className="w-9 h-9 rounded-xl bg-[#1E3014] text-[#A3E635] border border-[#365314] flex items-center justify-center">
                <Link2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-3 text-white">{links.length}</p>
          </div>

          {/* Card 2: Total Clicks */}
          <div className="bg-[#101A36] p-6 rounded-2xl shadow-xl border border-[#1C2B54] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Cliques Totais</p>
              <div className="w-9 h-9 rounded-xl bg-[#1E3014] text-[#A3E635] border border-[#365314] flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-3 text-white">
              {totalClicks > 999 ? `${(totalClicks / 1000).toFixed(1)}k` : totalClicks}
            </p>
          </div>

          {/* Card 3: Active Links / Top Link */}
          <div className="bg-[#101A36] p-6 rounded-2xl shadow-xl border border-[#1C2B54] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Links Ativos</p>
              <div className="w-9 h-9 rounded-xl bg-[#1E3014] text-[#A3E635] border border-[#365314] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <p className="text-3xl font-bold text-white">{activeLinksPercent}</p>
              {topLink && topLink.clicks > 0 && (
                <span className="text-xs font-mono font-bold text-[#A3E635] bg-[#162710] border border-[#2D4A1C] px-2 py-0.5 rounded">
                  Top: {topLink.slug}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form to Shorten Link */}
        <CreateLinkForm user={user} />

        {/* Real-time Link List & CRUD Operations in Navy Card Container */}
        <div className="bg-[#101A36] rounded-2xl shadow-xl border border-[#1C2B54] overflow-hidden">
          <LinkList
            links={links}
            loading={loading}
            onEdit={(link) => setEditingLink(link)}
            onDelete={(link) => setDeletingLink(link)}
          />
        </div>

      </div>

      {/* Modals */}
      {editingLink && (
        <EditLinkModal
          link={editingLink}
          isOpen={Boolean(editingLink)}
          onClose={() => setEditingLink(null)}
          onSuccess={() => {}}
        />
      )}

      {deletingLink && (
        <DeleteConfirmModal
          link={deletingLink}
          isOpen={Boolean(deletingLink)}
          onClose={() => setDeletingLink(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
