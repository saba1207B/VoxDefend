import React from 'react';
import {
  LayoutDashboard,
  Mic,
  FileAudio,
  PhoneCall,
  Network,
  History,
  BarChart3,
  Users,
  AlertOctagon,
  Cpu,
  Trophy,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import { VocalShieldLogo } from './VocalShieldLogo';

export type NavItemKey =
  | 'tech_noir'
  | 'dashboard'
  | 'live'
  | 'analysis'
  | 'monitor'
  | 'threats'
  | 'history'
  | 'training_studio'
  | 'analytics'
  | 'trusted_voices'
  | 'alerts'
  | 'system_status'
  | 'sih_demo'
  | 'settings';

interface SidebarProps {
  activeNav: NavItemKey;
  onSelectNav: (nav: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSearch?: () => void;
  alertCount?: number;
  isLiveMonitoring?: boolean;
}

interface NavItemDef {
  key: NavItemKey;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  section?: 'OPERATIONS' | 'INTELLIGENCE' | 'GOVERNANCE';
}

const NAV_ITEMS: NavItemDef[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    section: 'OPERATIONS',
  },
  {
    key: 'live',
    label: 'Live Detection',
    icon: Mic,
    badge: 'REC',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    section: 'OPERATIONS',
  },
  {
    key: 'analysis',
    label: 'Audio Analysis',
    icon: FileAudio,
    section: 'OPERATIONS',
  },
  {
    key: 'monitor',
    label: 'Call Monitor',
    icon: PhoneCall,
    badge: 'LIVE',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    section: 'OPERATIONS',
  },
  {
    key: 'threats',
    label: 'Threat Intelligence',
    icon: Network,
    section: 'INTELLIGENCE',
  },
  {
    key: 'history',
    label: 'Detection History',
    icon: History,
    section: 'INTELLIGENCE',
  },
  {
    key: 'training_studio',
    label: 'AI Training Studio',
    icon: Sparkles,
    badge: 'NEW',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    section: 'INTELLIGENCE',
  },
  {
    key: 'tech_noir',
    label: 'Tech-Noir 3D Lab',
    icon: Zap,
    badge: '3D',
    badgeColor: 'bg-cyan-500/20 text-[#00f3ff] border-[#00f3ff]/40',
    section: 'INTELLIGENCE',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    section: 'INTELLIGENCE',
  },
  {
    key: 'trusted_voices',
    label: 'Trusted Voices',
    icon: Users,
    section: 'INTELLIGENCE',
  },
  {
    key: 'alerts',
    label: 'Alerts',
    icon: AlertOctagon,
    badge: '3',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    section: 'GOVERNANCE',
  },
  {
    key: 'system_status',
    label: 'System Status',
    icon: Cpu,
    badge: 'ONLINE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    section: 'GOVERNANCE',
  },
  {
    key: 'sih_demo',
    label: 'SIH Demo Mode',
    icon: Trophy,
    badge: '26104',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    section: 'GOVERNANCE',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Sliders,
    section: 'GOVERNANCE',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenSearch,
  alertCount = 3,
  isLiveMonitoring = false,
}) => {
  const renderNavList = () => {
    let currentSection = '';

    return (
      <div className="space-y-1 px-2">
        {/* Quick Feature Search Trigger */}
        {onOpenSearch && (
          <div className="mb-3 px-1">
            <button
              onClick={() => {
                onOpenSearch();
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#00f3ff]/40 text-zinc-400 hover:text-white text-xs transition-all duration-300 group shadow-inner ${
                collapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Search all features (Ctrl+K)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-3.5 h-3.5 text-[#00f3ff] group-hover:scale-110 transition-transform flex-shrink-0" />
                {!collapsed && (
                  <span className="font-mono text-[11px] truncate text-zinc-400 group-hover:text-zinc-200">
                    Search features...
                  </span>
                )}
              </div>
              {!collapsed && (
                <kbd className="text-[9px] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-400 border border-white/10 font-bold">
                  Ctrl K
                </kbd>
              )}
            </button>
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.key;
          const showSectionHeader = item.section && item.section !== currentSection && !collapsed;
          if (item.section) currentSection = item.section;

          const badgeVal = item.key === 'alerts' ? alertCount : item.badge;

          return (
            <React.Fragment key={item.key}>
              {showSectionHeader && (
                <div className="pt-4 pb-1 px-3 text-[9px] font-mono font-bold tracking-[0.25em] text-zinc-500 uppercase">
                  {item.section}
                </div>
              )}

              <button
                onClick={() => {
                  onSelectNav(item.key);
                  onCloseMobile();
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group cursor-pointer ${
                  isActive
                    ? 'bg-[#00f3ff]/15 text-[#00f3ff] border border-[#00f3ff]/50 shadow-[0_0_18px_rgba(0,243,255,0.25)] font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/10'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Icon
                    className={`w-4 h-4 transition-colors duration-300 ${
                      isActive ? 'text-[#00f3ff]' : 'text-zinc-400 group-hover:text-white'
                    }`}
                  />
                  {item.key === 'live' && isLiveMonitoring && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_8px_#00f3ff]" />
                  )}
                </div>

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                    <span className="truncate font-sans font-medium">{item.label}</span>
                    {badgeVal !== undefined && (
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 font-bold ${
                          item.badgeColor || 'bg-white/[0.05] border-white/10 text-zinc-300'
                        }`}
                      >
                        {badgeVal}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#050505] border-r border-white/10 transition-all duration-300 select-none ${
          /* Desktop Width */
          collapsed ? 'lg:w-18' : 'lg:w-64'
        } ${
          /* Mobile Transform */
          mobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <VocalShieldLogo size="sm" showPulse={true} />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-sm tracking-tight text-white uppercase truncate">
                    VOXDEFEND<span className="text-[#00f3ff]">.</span>AI
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 font-bold">
                    SOC
                  </span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase truncate">
                  DEFENSE LAB
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List Area */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {renderNavList()}
        </div>

        {/* Protection State Pill Footer */}
        <div className="p-3 border-t border-white/10 bg-[#050505]">
          {!collapsed ? (
            <div className="bg-white/[0.03] rounded-2xl p-2.5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_8px_#00f3ff]" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-heading font-bold text-zinc-200">Protection Active</span>
                  <span className="text-[9px] font-mono text-zinc-500">Mesh v2.4 • 0.0.0.0:3000</span>
                </div>
              </div>
              <Shield className="w-3.5 h-3.5 text-[#00f3ff]" />
            </div>
          ) : (
            <div className="flex justify-center" title="Protection Active (Online)">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_10px_#00f3ff]" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
