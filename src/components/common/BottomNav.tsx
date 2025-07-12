import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MessageCircle, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnreadBadge } from "./UnreadBadge";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get current user's Convex ID for unread count
  const currentUser = useQuery(
    api.users.currentLoggedInUser,
    user?.email ? { email: user.email } : "skip"
  );

  // Get unread conversation count
  const unreadCount = useQuery(
    api.messages.getUnreadConversationCount,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const routes = [
    {
      label: "Profile",
      icon: User,
      href: "/profile",
      color: "text-blue-400",
    },
    {
      label: "Chats",
      icon: MessageCircle,
      href: "/chats",
      color: "text-green-400",
    },
    {
      label: "People",
      icon: Users,
      href: "/people",
      color: "text-purple-400",
    },
    {
      label: "Map",
      icon: MapPin,
      href: "/map",
      color: "text-orange-400",
    },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center h-16 md:hidden">
      {routes.map((route) => {
        const showUnreadBadge =
          route.href === "/chats" && unreadCount && unreadCount > 0;

        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium transition-colors relative",
              pathname === route.href ? route.color : "text-zinc-400"
            )}
          >
            <div className="relative">
              <route.icon
                className={cn(
                  "w-6 h-6 mb-0.5",
                  pathname === route.href ? route.color : "text-zinc-400"
                )}
              />
              {showUnreadBadge && (
                <UnreadBadge
                  count={unreadCount}
                  size="sm"
                  className="absolute -top-1 -right-1"
                />
              )}
            </div>
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
