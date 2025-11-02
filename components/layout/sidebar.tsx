'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store/auth-store'
import { useTeamStore } from '@/lib/store/team-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  Bell,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { RoleEquipe } from '@/lib/types'

const getNavigationItems = (role: RoleEquipe | undefined) => {
  const baseItems = [
    {
      title: 'Tableau de bord',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['PLAYER', 'STAFF', 'OWNER'],
    },
    {
      title: 'Profil',
      href: '/dashboard/profile',
      icon: UserCircle,
      roles: ['PLAYER', 'STAFF', 'OWNER'],
    },
    {
      title: 'Calendrier',
      href: '/dashboard/calendar',
      icon: Calendar,
      roles: ['PLAYER', 'STAFF', 'OWNER'],
    },
    {
      title: 'Mes Données',
      href: '/dashboard/my-data',
      icon: Activity,
      roles: ['PLAYER'],
    },
    {
      title: 'Joueurs',
      href: '/dashboard/players',
      icon: Users,
      roles: ['STAFF', 'OWNER'],
    },
    {
      title: 'Séances',
      href: '/dashboard/sessions',
      icon: Calendar,
      roles: ['STAFF', 'OWNER'],
    },
    {
      title: 'Alertes',
      href: '/dashboard/alerts',
      icon: Bell,
      roles: ['STAFF', 'OWNER'],
    },
    {
      title: 'Rapports',
      href: '/dashboard/reports',
      icon: FileText,
      roles: ['STAFF', 'OWNER'],
    },
    {
      title: 'Paramètres',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['OWNER'],
    },
  ]

  return baseItems.filter((item) => !role || item.roles.includes(role))
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { currentTeam, currentMembership } = useTeamStore()
  const { logout } = useAuth()

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  const navigationItems = getNavigationItems(currentMembership?.role)

  const userInitials = user
    ? `${user.nom.charAt(0)}${user.prenoms.charAt(0)}`.toUpperCase()
    : '??'

  if (!mounted) {
    return (
      <div className="w-64 h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-slate-900 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold">
                P+
              </div>
              <span className="font-bold text-lg">PerformePLUS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-slate-800"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Team Info */}
      {currentTeam && !collapsed && (
        <div className="p-4 border-b border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Équipe actuelle</p>
          <p className="font-medium truncate">{currentTeam.nom}</p>
          <p className="text-xs text-slate-400 capitalize">
            {currentMembership?.role.toLowerCase()}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-800">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photo ?? undefined} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.prenoms} {user?.nom}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            'w-full mt-3 text-slate-300 hover:bg-slate-800 hover:text-white',
            collapsed && 'px-0'
          )}
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Déconnexion</span>}
        </Button>
      </div>
    </div>
  )
}