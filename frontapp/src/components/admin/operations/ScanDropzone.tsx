'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle, X } from 'lucide-react';

interface ScanDropzoneProps {
  onFile: (file: File) => void;
  loading: boolean;
  error: string | null;
  onReset?: () => void;
  hasResult?: boolean;
}

export function ScanDropzone({
  onFile,
  loading,
  error,
  onReset,
  hasResult,
}: ScanDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        alert('Solo se aceptan archivos PDF.');
        return;
      }
      setSelectedFile(file);
      onFile(file);
    },
    [onFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleReset = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
    onReset?.();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !loading && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8
          cursor-pointer transition-all select-none
          ${
            dragOver
              ? 'border-[var(--text-primary)] bg-[var(--bg-muted)]'
              : 'border-[var(--border-subtle)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
          }
          ${loading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {loading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">
              Escaneando documento...
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {selectedFile?.name}
            </p>
          </>
        ) : selectedFile && hasResult ? (
          <>
            <FileText className="w-8 h-8 text-[var(--color-success)]" />
            <p className="text-[13px] text-[var(--text-primary)] font-medium">
              {selectedFile.name}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Documento escaneado correctamente
            </p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-[var(--text-muted)]" />
            <div className="text-center">
              <p className="text-[13px] font-medium text-[var(--text-primary)]">
                Arrastra un PDF aquí o haz clic para seleccionar
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Facturas, recibos por honorarios o boletas en PDF
              </p>
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-[var(--color-error)] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[var(--color-error)]">{error}</p>
        </div>
      )}

      {/* Reset */}
      {selectedFile && !loading && (
        <button
          onClick={handleReset}
          className="self-start inline-flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar y escanear otro
        </button>
      )}
    </div>
  );
}
