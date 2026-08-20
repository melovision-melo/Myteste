import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { ShortLink } from '../types';

interface LinkCardProps {
  link: ShortLink;
  onEdit: (link: ShortLink) => void;
  onDelete: (link: ShortLink) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr className="hover:bg-[#142247] transition-colors">
      {/* Column 1: Short Slug & Title */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#A3E635] hover:text-[#BEF264] transition-colors">
              {link.slug}
            </span>
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#64748B] hover:text-[#A3E635] transition-colors"
              title="Abrir destino"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          {link.title && (
            <span className="text-xs text-[#94A3B8] font-medium mt-0.5">
              {link.title}
            </span>
          )}
        </div>
      </td>

      {/* Column 2: Original URL Destination */}
      <td className="px-6 py-4 max-w-[280px]">
        <span
          className="text-sm text-[#94A3B8] truncate block hover:text-white transition-colors"
          title={link.originalUrl}
        >
          {link.originalUrl}
        </span>
      </td>

      {/* Column 3: Clicks */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#F8FAFC]">
          <span className="w-2 h-2 rounded-full bg-[#A3E635]" />
          <span>{link.clicks || 0}</span>
        </div>
      </td>

      {/* Column 4: Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            id={`btn-copy-${link.slug}`}
            onClick={handleCopy}
            className="text-xs font-bold text-[#A3E635] hover:text-[#BEF264] uppercase tracking-wider transition-colors flex items-center gap-1"
            title="Copiar URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#A3E635]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          <button
            id={`btn-edit-${link.slug}`}
            onClick={() => onEdit(link)}
            className="text-xs font-bold text-[#64748B] hover:text-amber-400 uppercase tracking-wider transition-colors flex items-center gap-1"
            title="Editar destino"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>

          <button
            id={`btn-delete-${link.slug}`}
            onClick={() => onDelete(link)}
            className="text-xs font-bold text-red-400/80 hover:text-red-400 uppercase tracking-wider transition-colors flex items-center gap-1"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir</span>
          </button>
        </div>
      </td>
    </tr>
  );
};
