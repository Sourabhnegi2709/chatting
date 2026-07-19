export const generateAvatarUrl = (seed) =>
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed || 'user')}`;
