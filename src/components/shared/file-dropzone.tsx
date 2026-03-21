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

// Static Tailwind classes mapped by color (dynamic template literals don't compile)
function getColorClasses(color: string, isDragActive: boolean) {
  const colorMap: Record<string, { border: string; bg: string; hoverBorder: string; text: string; textLight: string }> = {
    blue: {
      border: "border-blue-500",
      bg: "bg-blue-500/5",
      hoverBorder: "hover:border-blue-500/50",
      text: "text-blue-400",
      textLight: "text-blue-300",
    },
    purple: {
      border: "border-purple-500",
      bg: "bg-purple-500/5",
      hoverBorder: "hover:border-purple-500/50",
      text: "text-purple-400",
      textLight: "text-purple-300",
    },
    orange: {
      border: "border-orange-500",
      bg: "bg-orange-500/5",
      hoverBorder: "hover:border-orange-500/50",
      text: "text-orange-400",
      textLight: "text-orange-300",
    },
    green: {
      border: "border-green-500",
      bg: "bg-green-500/5",
      hoverBorder: "hover:border-green-500/50",
      text: "text-green-400",
      textLight: "text-green-300",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return {
    borderClass: isDragActive ? c.border : "border-border",
    bgClass: isDragActive ? c.bg : "",
    hoverBorder: c.hoverBorder,
    textClass: c.text,
    textLightClass: c.textLight,
  };
}

export function FileDropzone({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 50,
  accept = {
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "image/heic": [".heic"],
    "text/csv": [".csv"],
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

  const { borderClass, bgClass, hoverBorder, textClass, textLightClass } = getColorClasses(color, isDragActive);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed ${borderClass} ${bgClass} rounded-xl p-8 text-center ${hoverBorder} transition-all cursor-pointer`}
      >
        <input {...getInputProps()} />
        {extracting ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
            <p className="text-foreground/80">Extrayendo texto...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-10 h-10 ${textClass}`} />
            <p className={`${textLightClass} font-medium`}>Suelta los archivos aqui</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-10 h-10 text-muted-foreground" />
            <p className="text-foreground/80 font-medium">Arrastra archivos aqui o haz click</p>
            <p className="text-sm text-muted-foreground">
              PDF, Word, Excel, PowerPoint, imágenes, TXT — máx {maxSizeMB} MB ({files.length}/{maxFiles})
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
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <Icon className={`w-5 h-5 ${textClass} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
