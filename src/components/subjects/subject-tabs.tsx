"use client";

import { FileText, BarChart3, ClipboardList } from "lucide-react";

type Tab = "files" | "grades" | "pendings";

interface SubjectTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  filesCount: number;
  gradesCount: number;
  pendingActiveCount: number;
}

export function SubjectTabs({
  activeTab,
  onTabChange,
  filesCount,
  gradesCount,
  pendingActiveCount,
}: SubjectTabsProps) {
  const tabs = [
    { key: "files" as Tab, icon: FileText, label: "Archivos", count: filesCount },
    { key: "grades" as Tab, icon: BarChart3, label: "Notas", count: gradesCount },
    { key: "pendings" as Tab, icon: ClipboardList, label: "Pendientes", count: pendingActiveCount },
  ];

  return (
    <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.key
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
          {tab.count > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? "bg-white/20" : "bg-slate-700"
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
