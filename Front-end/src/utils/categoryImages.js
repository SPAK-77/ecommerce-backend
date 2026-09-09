// Category Image and Icon Helper Utility

export const CATEGORY_PRESET_GALLERY = [
  { name: 'Stationery', icon: '✏️', url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Snacks', icon: '🍪', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Beverages', icon: '☕', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Electronics', icon: '💡', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cleaning', icon: '🧹', url: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=800&q=80' },
  { name: 'Furniture', icon: '🪑', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pantry Essentials', icon: '🥫', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80' },
  { name: 'Office Supplies', icon: '📎', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80' },
];

export const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80';

export const getCategoryImage = (category) => {
  if (!category) return DEFAULT_CATEGORY_IMAGE;

  // 1. Direct image field
  if (category.image && typeof category.image === 'string' && category.image.trim() !== '') {
    const img = category.image.trim();
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    if (img.startsWith('/uploads') || img.startsWith('uploads')) {
      const clean = img.startsWith('/') ? img : `/${img}`;
      return `http://localhost:5000${clean}`;
    }
    return img.startsWith('/') ? img : `/${img}`;
  }

  // 2. Icon field if it's a URL
  if (category.icon && typeof category.icon === 'string') {
    const ic = category.icon.trim();
    if (ic.startsWith('http://') || ic.startsWith('https://') || ic.startsWith('/uploads')) {
      if (ic.startsWith('/uploads')) return `http://localhost:5000${ic}`;
      return ic;
    }
  }

  // 3. Preset match by name
  if (category.name) {
    const nameLower = category.name.toLowerCase();
    const found = CATEGORY_PRESET_GALLERY.find(p => p.name.toLowerCase() === nameLower || nameLower.includes(p.name.toLowerCase()));
    if (found) return found.url;
  }

  // 4. Default fallback
  return DEFAULT_CATEGORY_IMAGE;
};

export const handleCategoryImageError = (e, category) => {
  e.target.onerror = null;
  if (category && category.image && category.image !== e.target.src) {
    e.target.src = category.image;
  } else {
    e.target.src = DEFAULT_CATEGORY_IMAGE;
  }
};
