"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Brain,
  Calendar,
  GraduationCap,
  BarChart3,
  ClipboardList,
  Settings,
  Sparkles,
  LogOut,
  ChevronsUpDown,
  Timer,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import { signOutUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

const mainNav = [
  { title: "Inicio", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Asignaturas", icon: BookOpen, href: "/subjects" },
  { title: "Notas", icon: BarChart3, href: "/grades" },
  { title: "Pendientes", icon: ClipboardList, href: "/pendings" },
  { title: "Horario", icon: Calendar, href: "/schedule" },
  { title: "Pomodoro", icon: Timer, href: "/pomodoro" },
  { title: "Resúmenes IA", icon: FileText, href: "/summaries", badge: "IA" },
  { title: "Quizzes", icon: Brain, href: "/quizzes", badge: "IA" },
  { title: "Prep. Pruebas", icon: GraduationCap, href: "/exam-prep", badge: "Pro" },
];

const secondaryNav = [
  { title: "Configuración", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppStore();

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  return (
    <Sidebar className="border-r border-slate-800">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">StudyHub</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((navItem) => {
                const isActive = pathname === navItem.href;
                return (
                  <SidebarMenuItem key={navItem.href}>
                    <SidebarMenuButton
                      render={<Link href={navItem.href} className="flex items-center gap-3" />}
                      isActive={isActive}
                      className="relative"
                    >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
                            transition={{ type: "spring", duration: 0.4 }}
                          />
                        )}
                        <navItem.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                        <span className={`relative z-10 ${isActive ? "text-white font-medium" : "text-slate-300"}`}>
                          {navItem.title}
                        </span>
                        {navItem.badge && (
                          <Badge
                            variant="outline"
                            className={`ml-auto relative z-10 text-[10px] px-1.5 py-0 ${
                              navItem.badge === "Pro"
                                ? "border-amber-500/50 text-amber-400"
                                : "border-blue-500/50 text-blue-400"
                            }`}
                          >
                            {navItem.badge}
                          </Badge>
                        )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider">
            Cuenta
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((navItem) => {
                const isActive = pathname === navItem.href;
                return (
                  <SidebarMenuItem key={navItem.href}>
                    <SidebarMenuButton render={<Link href={navItem.href} className="flex items-center gap-3" />} isActive={isActive}>
                        <navItem.icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                        <span className={isActive ? "text-white font-medium" : "text-slate-300"}>
                          {navItem.title}
                        </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors" />}
          >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {user?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {user?.displayName || "Usuario"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || ""}
                </p>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
            <DropdownMenuItem render={<Link href="/settings" className="text-slate-300" />}>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
