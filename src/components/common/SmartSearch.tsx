import { useState, useRef, useEffect } from "react";
import { Search, X, MapPin, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { useDebounce } from "use-debounce";
import { useGeolocation } from "@uidotdev/usehooks";
import { Id } from "../../../convex/_generated/dataModel";

interface GeoLocation {
  latitude: { value: number } | null;
  longitude: { value: number } | null;
}

type SearchResult = {
  type: "person" | "conversation";
  id: Id<"users"> | Id<"messages">;
  title: string;
  subtitle?: string;
  profilePic?: string;
  distance?: number;
  timestamp?: number;
  href: string;
};

type Person = {
  _id: Id<"users">;
  name: string;
  profilePic?: string;
  distance: number;
  bio?: string;
  tags?: string[];
};

type Conversation = {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  content: string;
  timestamp: number;
  preview: string;
  sender: {
    _id: Id<"users">;
    name: string;
    profilePic?: string;
  };
};

export function SmartSearch() {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useGeolocation() as GeoLocation;

  // Search results from Convex
  const nearbyPeople = useQuery(
    api.search.searchPeopleNearby,
    debouncedQuery && location.latitude && location.longitude
      ? {
          searchTerm: debouncedQuery,
          latitude: location.latitude.value,
          longitude: location.longitude.value,
          maxDistance: 50, // 50km radius
        }
      : "skip"
  );

  const conversations = useQuery(
    api.search.searchConversations,
    user?.id && debouncedQuery
      ? {
          searchTerm: debouncedQuery,
          userId: user.id as Id<"users">,
        }
      : "skip"
  );

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Combine and process search results
  const processedResults: SearchResult[] = [
    ...(nearbyPeople?.map((person: Person) => ({
      type: "person" as const,
      id: person._id,
      title: person.name,
      subtitle: person.bio,
      profilePic: person.profilePic,
      distance: person.distance,
      href: `/user/${person._id}`,
    })) ?? []),
    ...(conversations?.map((conv: Conversation) => ({
      type: "conversation" as const,
      id: conv._id,
      title: conv.sender.name,
      subtitle: conv.preview,
      profilePic: conv.sender.profilePic,
      timestamp: conv.timestamp,
      href: `/chats/${conv.conversationId}`,
    })) ?? []),
  ];

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search people nearby, conversations..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
            onFocus={() => setIsOpen(true)}
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-700"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
            >
              <X className="w-4 h-4 text-zinc-400" />
            </Button>
          )}
        </div>
      </div>

      {/* Live Search Results Dropdown */}
      {isOpen && query && processedResults.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto">
          <div className="py-2">
            {processedResults.map((result) => (
              <a
                key={result.id}
                href={result.href}
                className="flex items-center px-4 py-2 hover:bg-zinc-800 cursor-pointer gap-3"
              >
                {/* Profile Picture */}
                <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                  {result.profilePic ? (
                    <img
                      src={result.profilePic}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-600 flex items-center justify-center">
                      <span className="text-zinc-400 text-xl">
                        {result.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium truncate">
                      {result.title}
                    </span>
                    {/* Distance or Time */}
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      {result.type === "person" ? (
                        <>
                          <MapPin className="w-3 h-3" />
                          {Math.round(result.distance!)}km
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3 h-3" />
                          {formatDistanceToNow(result.timestamp!, {
                            addSuffix: true,
                          })}
                        </>
                      )}
                    </span>
                  </div>
                  {result.subtitle && (
                    <p className="text-sm text-zinc-400 truncate">
                      {result.subtitle}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
