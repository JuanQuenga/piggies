import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MessageCircle, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const routes = [
    {
      label: "Profile",
      icon: User,
      href: "/profile",
    },
    {
      label: "Chats",
      icon: MessageCircle,
      href: "/chats",
    },
    {
      label: "People",
      icon: Users,
      href: "/people",
    },
    {
      label: "Map",
      icon: MapPin,
      href: "/map",
    },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center h-16 md:hidden">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium transition-colors",
            pathname === route.href ? "text-white" : "text-zinc-400"
          )}
        >
          <route.icon className="w-6 h-6 mb-0.5" />
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
