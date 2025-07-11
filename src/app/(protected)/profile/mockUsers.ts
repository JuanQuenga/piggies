// Mock users for TileView
export const mockUsers = [
  {
    _id: "mock1" as any,
    userId: "mock_user_1" as any,
    displayName: "Alex",
    description: "Looking for fun tonight",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "hosting",
    lastSeen: Date.now() - 2 * 60 * 1000, // 2 minutes ago - ONLINE
    _distance: 0.5,
    backgroundColor: "bg-red-500/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock2" as any,
    userId: "mock_user_2" as any,
    displayName: "Sam",
    description: "Down for anything",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "not-hosting",
    lastSeen: Date.now() - 1 * 60 * 1000, // 1 minute ago - ONLINE
    _distance: 1.2,
    backgroundColor: "bg-blue-500/20",
    isVisible: false, // ONLINE but NOT LOOKING
  },
  {
    _id: "mock3" as any,
    userId: "mock_user_3" as any,
    displayName: "Jordan",
    description: "Hotel room available",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "hotel",
    lastSeen: Date.now() - 30 * 1000, // 30 seconds ago - ONLINE
    _distance: 2.1,
    backgroundColor: "bg-green-500/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock4" as any,
    userId: "mock_user_4" as any,
    displayName: "Casey",
    description: "Car play anyone?",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "car",
    lastSeen: Date.now() - 3 * 60 * 1000, // 3 minutes ago - ONLINE
    _distance: 0.8,
    backgroundColor: "bg-purple-500/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock5" as any,
    userId: "mock_user_5" as any,
    displayName: "Taylor",
    description: "Gloryhole setup",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "gloryhole",
    lastSeen: Date.now() - 45 * 1000, // 45 seconds ago - ONLINE
    _distance: 1.5,
    backgroundColor: "bg-pink-500/20",
    isVisible: false, // ONLINE but NOT LOOKING
  },
  {
    _id: "mock6" as any,
    userId: "mock_user_6" as any,
    displayName: "Riley",
    description: "Group fun tonight",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "hosting-group",
    lastSeen: Date.now() - 90 * 1000, // 1.5 minutes ago - ONLINE
    _distance: 3.2,
    backgroundColor: "bg-yellow-500/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock7" as any,
    userId: "mock_user_7" as any,
    displayName: "Quinn",
    description: "Cruising spot nearby",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "cruising",
    lastSeen: Date.now() - 15 * 1000, // 15 seconds ago - ONLINE
    _distance: 0.3,
    backgroundColor: "bg-indigo-500/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock8" as any,
    userId: "mock_user_8" as any,
    displayName: "Morgan",
    description: "Looking for tonight",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "not-hosting",
    lastSeen: Date.now() - 4 * 60 * 1000, // 4 minutes ago - ONLINE
    _distance: 2.8,
    backgroundColor: "bg-orange-500/20",
    isVisible: false, // ONLINE but NOT LOOKING
  },
  {
    _id: "mock9" as any,
    userId: "mock_user_9" as any,
    displayName: "Avery",
    description: "Hotel room ready",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "hotel",
    lastSeen: Date.now() - 2 * 60 * 1000, // 2 minutes ago - ONLINE
    _distance: 1.7,
    backgroundColor: "bg-teal-500/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock10" as any,
    userId: "mock_user_10" as any,
    displayName: "Blake",
    description: "Car fun available",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "car",
    lastSeen: Date.now() - 1 * 60 * 1000, // 1 minute ago - ONLINE
    _distance: 0.9,
    backgroundColor: "bg-cyan-500/20",
    isVisible: false, // ONLINE but NOT LOOKING
  },
  {
    _id: "mock11" as any,
    userId: "mock_user_11" as any,
    displayName: "Drew",
    description: "Looking for fun",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "not-hosting",
    lastSeen: Date.now() - 10 * 60 * 1000, // 10 minutes ago - OFFLINE
    _distance: 4.1,
    backgroundColor: "bg-emerald-500/20",
    isVisible: false, // OFFLINE
  },
  {
    _id: "mock12" as any,
    userId: "mock_user_12" as any,
    displayName: "Emery",
    description: "Gloryhole ready",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "gloryhole",
    lastSeen: Date.now() - 20 * 1000, // 20 seconds ago - ONLINE
    _distance: 1.1,
    backgroundColor: "bg-violet-500/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock13" as any,
    userId: "mock_user_13" as any,
    displayName: "Finley",
    description: "Looking for tonight",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "not-hosting",
    lastSeen: Date.now() - 8 * 60 * 1000, // 8 minutes ago - OFFLINE
    _distance: 2.3,
    backgroundColor: "bg-red-600/20",
    isVisible: false, // OFFLINE
  },
  {
    _id: "mock14" as any,
    userId: "mock_user_14" as any,
    displayName: "Gray",
    description: "Hotel room available",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "hotel",
    lastSeen: Date.now() - 45 * 1000, // 45 seconds ago - ONLINE
    _distance: 0.7,
    backgroundColor: "bg-blue-600/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock15" as any,
    userId: "mock_user_15" as any,
    displayName: "Harper",
    description: "Car fun anyone?",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "car",
    lastSeen: Date.now() - 2 * 60 * 1000, // 2 minutes ago - ONLINE
    _distance: 1.8,
    backgroundColor: "bg-green-600/20",
    isVisible: false, // ONLINE but NOT LOOKING
  },
  {
    _id: "mock16" as any,
    userId: "mock_user_16" as any,
    displayName: "Indigo",
    description: "Gloryhole setup",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "gloryhole",
    lastSeen: Date.now() - 30 * 1000, // 30 seconds ago - ONLINE
    _distance: 3.4,
    backgroundColor: "bg-purple-600/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock17" as any,
    userId: "mock_user_17" as any,
    displayName: "Jules",
    description: "Group fun tonight",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "hosting-group",
    lastSeen: Date.now() - 1 * 60 * 1000, // 1 minute ago - ONLINE
    _distance: 0.4,
    backgroundColor: "bg-pink-600/20",
    isVisible: true, // ONLINE & LOOKING
  },
  {
    _id: "mock18" as any,
    userId: "mock_user_18" as any,
    displayName: "Kai",
    description: "Cruising spot nearby",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "cruising",
    lastSeen: Date.now() - 15 * 1000, // 15 seconds ago - ONLINE
    _distance: 2.7,
    backgroundColor: "bg-yellow-600/20",
    isVisible: false, // ONLINE but NOT LOOKING
  },
  {
    _id: "mock19" as any,
    userId: "mock_user_19" as any,
    displayName: "Lane",
    description: "Looking for fun",
    avatarUrl: "/pig-snout.svg",
    hostingStatus: "not-hosting",
    lastSeen: Date.now() - 12 * 60 * 1000, // 12 minutes ago - OFFLINE
    _distance: 1.3,
    backgroundColor: "bg-indigo-600/20",
    isVisible: false, // OFFLINE
  },
];
