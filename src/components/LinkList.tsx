import React, { useState } from 'react';
import { Search, Inbox } from 'lucide-react';
import { ShortLink } from '../types';
import { LinkCard } from './LinkCard';

interface LinkListProps {
  links: ShortLink[];
  loading: boolean;
  onEdit: (link: ShortLink) => void;
  onDelete: (link: ShortLink) => void;
}

export const LinkList: React.FC<LinkListProps> = ({
  links,
  loading,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'clicks'>('date');

  const filteredLinks = links.filter((link) => {
    const term = searchTerm.toLowerCase();
    return (
      link.slug.toLowerCase().includes(term) ||
      link.originalUrl.toLowerCase().includes(term) ||
      (link.title && link.title.toLowerCase().includes(term))
    );
  });

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (sortBy === 'clicks') {
      return (b.clicks || 0) - (a.clicks || 0);
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return (
    <div className="flex flex-col bg-[#101A36] text-[#F8FAFC]">
      {/* Top Header & Search Controls */}
      <div className="p-6 border-b border-[#1C2B54] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E1730]">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold text-white">
            Lista de Links
          </h3>
          <span className="rounded-full bg-[#1E3014] border border-[#365314] px-2.5 py-0.5 text-xs font-bold text-[#A3E635]">
            {links.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="input-search-links"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por slug ou URL..."
              className="w-full rounded-xl border border-[#1C2B54] bg-[#090F24] py-2 pl-9 pr-3 text-xs text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] focus:border-[#4D7C0F] transition"
            />
          </div>

          {/* Sort Selector */}
          <select
            id="select-sort-links"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'clicks')}
            className="rounded-xl border border-[#1C2B54] bg-[#090F24] px-3 py-2 text-xs font-bold text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4D7C0F]"
          >
            <option value="date">Mais Recentes</option>
            <option value="clicks">Mais Acessados</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && links.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4D7C0F] border-t-[#A3E635] mb-3" />
          <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
            Carregando links do Firestore...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && links.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E3014] border border-[#365314] text-[#A3E635] mb-3 shadow-lg">
            <Inbox className="h-7 w-7" />
          </div>
          <h4 className="text-base font-bold text-white">
            Nenhum link encurtado ainda
          </h4>
          <p className="mt-1 text-xs text-[#94A3B8] max-w-sm">
            Cole uma URL original no formulário acima para gerar seu primeiro link com o padrão militar <code className="font-mono text-[#A3E635] font-bold bg-[#162710] border border-[#2D4A1C] px-1.5 py-0.5 rounded">melovisionXXXX</code>.
          </p>
        </div>
      )}

      {/* Table Container */}
      {sortedLinks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0C152D] border-b border-[#1C2B54]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Link Encurtado
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Cliques
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2B54]">
              {sortedLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Search Results */}
      {links.length > 0 && sortedLinks.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-[#94A3B8]">
            Nenhum link encontrado para o termo "{searchTerm}".
          </p>
        </div>
      )}
    </div>
  );
};
