export const mockContacts = [
    {
        id: "1",
        name: "Arjun Sharma",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
        status: "online",
        unreadCount: 2,
        messages: [
            { id: "m1", senderId: "1", text: "Hey! Are we still reviewing the MERN schemas today?", timestamp: "10:00 AM" },
            { id: "m2", senderId: "me", text: "Yes! Let me finish setting up Tailwind and I'll jump on.", timestamp: "10:02 AM" },
            { id: "m3", senderId: "1", text: "Awesome. I'll have the repo pulled up.", timestamp: "10:03 AM" },
            { id: "m4", senderId: "1", text: "Let me know when you are ready!", timestamp: "10:04 AM" },
        ]
    },
    {
        id: "2",
        name: "Neha Patel",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
        status: "offline",
        unreadCount: 0,
        messages: [
            { id: "m5", senderId: "2", text: "Did you check out the new design changes?", timestamp: "Yesterday" },
            { id: "m6", senderId: "me", text: "Looks clean, especially the dark mode panels.", timestamp: "Yesterday" },
        ]
    },
    {
        id: "3",
        name: "Rohan Das",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
        status: "online",
        unreadCount: 0,
        messages: [
            { id: "m7", senderId: "3", text: "Down for a game of chess later tonight?", timestamp: "9:15 AM" },
            { id: "m8", senderId: "me", text: "Always! London System incoming ♟️", timestamp: "9:20 AM" },
        ]
    }
];