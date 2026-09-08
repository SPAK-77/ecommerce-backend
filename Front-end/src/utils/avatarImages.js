export const CARTOON_AVATAR_PRESETS = [
  {
    id: 'male',
    name: 'Male Avatar',
    gender: 'Male',
    icon: '👨',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4'
  },
  {
    id: 'female',
    name: 'Female Avatar',
    gender: 'Female',
    icon: '👩',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf'
  }
];

export const MALE_AVATAR = CARTOON_AVATAR_PRESETS[0];
export const FEMALE_AVATAR = CARTOON_AVATAR_PRESETS[1];
export const DEFAULT_AVATAR_IMAGE = MALE_AVATAR.url;

export const getAvatarImage = (avatar) => {
  if (!avatar || typeof avatar !== 'string' || avatar.trim() === '') {
    return null;
  }
  const clean = avatar.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  if (clean.startsWith('/uploads') || clean.startsWith('uploads')) {
    const pathClean = clean.startsWith('/') ? clean : `/${clean}`;
    return `http://localhost:5000${pathClean}`;
  }
  return clean;
};

export const handleAvatarImageError = (e) => {
  e.target.onerror = null;
  e.target.src = DEFAULT_AVATAR_IMAGE;
};
