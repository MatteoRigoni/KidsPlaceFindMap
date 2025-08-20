import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, LogIn, LogOut, User } from "lucide-react";
import { type VenueType } from "@shared/schema";
import { VENUE_TYPE_CONFIG } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AuthModal from "./AuthModal";
import * as LucideIcons from "lucide-react";

interface SidebarProps {
  activeFilters: Set<VenueType>;
  onToggleFilter: (venueType: VenueType) => void;
  onClose: () => void;
  showCloseButton: boolean;
}

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    users: LucideIcons.Users,
    trees: LucideIcons.Trees,
    building: LucideIcons.Building,
    palette: LucideIcons.Palette,
    atom: LucideIcons.Atom,
    globe: LucideIcons.Globe,
    waves: LucideIcons.Waves,
  };
  return iconMap[iconName] || LucideIcons.MapPin;
};

export default function Sidebar({ activeFilters, onToggleFilter, onClose, showCloseButton }: SidebarProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text-dark">KidFriendly Maps</h1>
          {showCloseButton && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">Discover amazing places for kids</p>
        
        {/* Auth Section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {isLoading ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {(user as any)?.profileImageUrl ? (
                  <img 
                    src={(user as any).profileImageUrl} 
                    alt="Profile" 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-sm text-gray-700 truncate">
                  {(user as any)?.firstName || (user as any)?.email || 'User'}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setAuthModalOpen(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      
      {/* Filters */}
      <div className="p-6 flex-1">
        <h2 className="text-lg font-medium mb-4 text-text-dark">Place Types</h2>
        <div className="space-y-3">
          {Object.entries(VENUE_TYPE_CONFIG).map(([venueType, config]) => {
            const IconComponent = getIcon(config.icon);
            const isActive = activeFilters.has(venueType as VenueType);
            
            return (
              <div
                key={venueType}
                onClick={() => onToggleFilter(venueType as VenueType)}
                className="venue-filter flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors venue-filter-active bg-light-bg text-[12px]"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isActive ? config.color : '#9CA3AF' }}
                  >
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-text-dark text-sm whitespace-nowrap">{config.name}</span>
                </div>
                <div className={`toggle-switch ${isActive ? '' : 'venue-filter-inactive'}`} 
                     style={{ backgroundColor: isActive ? config.color : '#D1D5DB' }}>
                  <div className={`toggle-slider ${isActive ? 'venue-filter-active' : 'venue-filter-inactive'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pro tip */}
        <div className="mt-8 p-4 bg-gradient-to-r from-map-blue to-marker-purple rounded-lg text-white">
          <h3 className="font-semibold mb-2">Pro Tip</h3>
          <p className="text-sm opacity-90">Search for any city to discover kid-friendly places with detailed information.</p>
        </div>
      </div>
    </div>
  );
}
