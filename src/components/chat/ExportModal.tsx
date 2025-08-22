import React from 'react';
import { X, FileText, Code, Hash } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'text' | 'json' | 'markdown') => void;
  religion: string;
  messageCount: number;
}

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  religion,
  messageCount,
}: ExportModalProps) {
  if (!isOpen) return null;

  const handleExport = (format: 'text' | 'json' | 'markdown') => {
    onExport(format);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-xl text-white font-medium"
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Export Chat
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat info */}
        <div className="mb-6 text-white/80 text-sm">
          <p>
            <strong>Religion:</strong> {religion}
          </p>
          <p>
            <strong>Messages:</strong> {messageCount}
          </p>
        </div>

        {/* Export options */}
        <div className="space-y-3">
          <button
            onClick={() => handleExport('text')}
            className="w-full flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <FileText className="w-5 h-5 text-white/80" />
            <div className="text-left">
              <div className="text-white font-medium">Plain Text</div>
              <div className="text-white/60 text-sm">Simple text format, easy to read</div>
            </div>
          </button>

          <button
            onClick={() => handleExport('markdown')}
            className="w-full flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <Hash className="w-5 h-5 text-white/80" />
            <div className="text-left">
              <div className="text-white font-medium">Markdown</div>
              <div className="text-white/60 text-sm">Formatted text with headers</div>
            </div>
          </button>

          <button
            onClick={() => handleExport('json')}
            className="w-full flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <Code className="w-5 h-5 text-white/80" />
            <div className="text-left">
              <div className="text-white font-medium">JSON</div>
              <div className="text-white/60 text-sm">Structured data format</div>
            </div>
          </button>
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 text-white/60 hover:text-white transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
