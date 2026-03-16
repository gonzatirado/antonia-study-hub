"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, FileText, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onTextExtracted?: (text: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: Record<string, string[]>;
  color?: string;
}

const FILE_ICONS: Record<string, typeof FileText> = {
  "application/pdf": FileText,
  "image/": Image,
};

function getFileIcon(type: string) {
  for (const [key, Icon] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(key)) return Icon;
  }
  return File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 50,
  accept = {
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
  color = "blue",
}: FileDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [extracting, setExtracting] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [files, maxFiles, onFilesSelected]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles,
  });

  const borderColor = isDragActive ? `border-${color}-500` : "border-slate-700";
  const bgColor = isDragActive ? `bg-${color}-500/5` : "";

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed ${borderColor} ${bgColor} rounded-xl p-8 text-center hover:border-${color}-500/50 transition-all cursor-pointer`}
      >
        <input {...getInputProps()} />
        {extracting ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
            <p className="text-slate-300">Extrayendo texto...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-10 h-10 text-${color}-400`} />
            <p className={`text-${color}-300 font-medium`}>Suelta los archivos aquí</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-10 h-10 text-slate-500" />
            <p className="text-slate-300 font-medium">Arrastra archivos aquí o haz click</p>
            <p className="text-sm text-slate-500">
              PDF, DOC, TXT — máximo {maxSizeMB} MB ({files.length}/{maxFiles} archivos)
            </p>
          </div>
        )}
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.map((file, index) => {
          const Icon = getFileIcon(file.type);
          return (
            <motion.div
              key={`${file.name}-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <Icon className={`w-5 h-5 text-${color}-400 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
