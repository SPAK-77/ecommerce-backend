// Helper to resolve product image URL with high-quality fallback photos

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

const PRODUCT_IMAGE_MAP = {
  // ── Stationery ───────────────────────────────────────────────────────────
  'Premium Ball Pen Pack (10)': 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=600&q=80',
  'A4 Notepad (200 pages)': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'Sticky Notes Pack': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
  'File Folder Set (5)': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
  'Whiteboard Markers': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'Stapler + 1000 Pins': 'https://images.unsplash.com/photo-1590247819200-16176cd17a1e?auto=format&fit=crop&w=600&q=80',
  'Highlighter Marker Set (6)': 'https://images.unsplash.com/photo-1572965733001-b7e4c5e9a44e?auto=format&fit=crop&w=600&q=80',
  'Spiral Bound Diary (A5)': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'Scissors Set (3 sizes)': 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=600&q=80',
  'Transparent Tape Rolls (12)': 'https://images.unsplash.com/photo-1612204103590-b84f24c49e45?auto=format&fit=crop&w=600&q=80',
  'Gel Pen Set (20 colors)': 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=600&q=80',
  'Document Binder (A4)': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
  'Ruler + Set Square Kit': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
  'Correction Tape (6-pack)': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  'Index Tab Dividers (10-set)': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
  'Mechanical Pencils Set (5)': 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=600&q=80',
  'Letter Tray (3-tier)': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
  'Stamp Pad + Ink (3-color)': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  'Bubble Wrap Roll (5m)': 'https://images.unsplash.com/photo-1612204103590-b84f24c49e45?auto=format&fit=crop&w=600&q=80',
  'Cork Notice Board (60×45cm)': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',

  // ── Snacks ──────────────────────────────────────────────────────────────
  'Lays Classic Chips (Pack of 6)': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
  'Assorted Biscuits Box': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
  'Namkeen Mix (500g)': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281352?auto=format&fit=crop&w=600&q=80',
  'Dark Chocolate Pack': 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=600&q=80',
  'Protein Bar Box (12)': 'https://images.unsplash.com/photo-1622484210800-8851b576f9d2?auto=format&fit=crop&w=600&q=80',
  'Kurkure Masala Munch (5-pack)': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80',
  'Roasted Peanuts (500g)': 'https://images.unsplash.com/photo-1601379760883-1bb497c558ca?auto=format&fit=crop&w=600&q=80',
  'Mixed Dry Fruits (250g)': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  'Digestive Marie Biscuits (3-pack)': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
  'Popcorn Ready-to-Eat (6-pack)': 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80',
  'Granola Bars Box (15 bars)': 'https://images.unsplash.com/photo-1586952518485-11b180e92764?auto=format&fit=crop&w=600&q=80',
  'Masala Cashews (200g)': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  'Rice Cakes Pack (5)': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281352?auto=format&fit=crop&w=600&q=80',
  'Maggi Noodles (Pack of 12)': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80',
  'Pringles Original (3-pack)': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
  'Cheese Crackers Pack': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
  'Trail Mix Adventure (400g)': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  'Wafer Biscuits Vanilla (3-pack)': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
  'Instant Soup Sachets (10)': 'https://images.unsplash.com/photo-1576158113928-4c240eaaf360?auto=format&fit=crop&w=600&q=80',
  'Sesame Snack Bars (10-pack)': 'https://images.unsplash.com/photo-1586952518485-11b180e92764?auto=format&fit=crop&w=600&q=80',

  // ── Beverages ────────────────────────────────────────────────────────────
  'Nescafé Classic (200g)': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  'Lipton Green Tea (100 bags)': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
  'Tropicana Mixed Fruit (6-pack)': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
  'Cold Coffee Sachets (20)': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
  'Mineral Water Bottles (24-pack)': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
  'Red Bull Energy Drink (24-pack)': 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=600&q=80',
  'Bru Cappuccino Sachets (30)': 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?auto=format&fit=crop&w=600&q=80',
  'Minute Maid Orange (1L, 6-pack)': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
  'Ovaltine Chocolate Malt (500g)': 'https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?auto=format&fit=crop&w=600&q=80',
  'Tetley Chamomile Tea (50 bags)': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=600&q=80',
  'Coca-Cola Cans (330ml × 12)': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80',
  'Horlicks Classic (500g)': 'https://images.unsplash.com/photo-1608138404239-d2e2b0f4e5e9?auto=format&fit=crop&w=600&q=80',
  'Iced Lemon Tea Sachets (20)': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
  'Protein Shake Powder (1kg)': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80',
  'Coconut Water Tetra Pack (6-pack)': 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=600&q=80',
  'Sprite Lemon Soda (330ml × 12)': 'https://images.unsplash.com/photo-1632765854612-9b02b6ec2b15?auto=format&fit=crop&w=600&q=80',
  'Starbucks Via Instant (12 sachets)': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  'Masala Chai Premix (500g)': 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=600&q=80',
  'Mango Frooti Tetra (200ml × 12)': 'https://images.unsplash.com/photo-1560963873-58a7a593f80e?auto=format&fit=crop&w=600&q=80',
  'Glucon-D Orange (1kg)': 'https://images.unsplash.com/photo-1503327843880-c19b0e1e1c94?auto=format&fit=crop&w=600&q=80',

  // ── Electronics ──────────────────────────────────────────────────────────
  'USB-C Charging Cable': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
  'AA Batteries Pack (20)': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
  'Wireless Mouse': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
  'USB Hub 4-Port': 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80',
  'Mechanical Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  'Webcam 1080p Full HD': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80',
  'Power Bank 20000mAh': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80',
  'Noise Cancelling Earbuds': 'https://images.unsplash.com/photo-1590658165737-15a047b7c471?auto=format&fit=crop&w=600&q=80',
  'LED Desk Lamp': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80',
  'Laptop Stand Adjustable': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80',
  'Screen Cleaning Kit': 'https://images.unsplash.com/photo-1593640408182-31c228d9d4ab?auto=format&fit=crop&w=600&q=80',
  'Type-C Multi-port Adapter': 'https://images.unsplash.com/photo-1625065804765-07fa3f95b5e5?auto=format&fit=crop&w=600&q=80',
  'Wireless Charger Pad 15W': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
  'Bluetooth Speaker Compact': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
  'USB Desk Fan': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
  'Cable Organiser Kit': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
  'HDMI Cable 2m': 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=600&q=80',
  'Smart Plug (Wi-Fi)': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=600&q=80',
  'AAA Batteries Pack (20)': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
  'USB Desk LED Light': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',

  // ── Cleaning ─────────────────────────────────────────────────────────────
  'Hand Sanitizer 500ml': 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=600&q=80',
  'Floor Cleaner 1L': 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80',
  'Tissue Box (200 pulls)': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  'Disinfectant Spray 500ml': 'https://images.unsplash.com/photo-1585837434704-d5f88fcaab3c?auto=format&fit=crop&w=600&q=80',
  'Microfibre Cleaning Cloths (5-pack)': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80',
  'Toilet Bowl Cleaner 750ml': 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80',
  'Liquid Handwash Refill 750ml': 'https://images.unsplash.com/photo-1584499165997-ba84fc2f7b66?auto=format&fit=crop&w=600&q=80',
  'Glass Cleaner Spray 500ml': 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=600&q=80',
  'Wet Wipes Pack (80 sheets)': 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&w=600&q=80',
  'Dustbin Liners 60L (50-pack)': 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=600&q=80',
  'Toilet Paper Roll (12-pack)': 'https://images.unsplash.com/photo-1585737904040-f6ad3e3e4b47?auto=format&fit=crop&w=600&q=80',
  'All-Purpose Cleaner 2L': 'https://images.unsplash.com/photo-1585837424907-8a82dc7ca01d?auto=format&fit=crop&w=600&q=80',
  'Broom + Dustpan Set': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
  'Dish Wash Liquid 1L': 'https://images.unsplash.com/photo-1585840917936-9e1f07c02df1?auto=format&fit=crop&w=600&q=80',
  'Paper Towel Roll (6-pack)': 'https://images.unsplash.com/photo-1585737574122-0fa56bb7d66b?auto=format&fit=crop&w=600&q=80',
  'Mop with Bucket Set': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  'Air Freshener Spray 300ml': 'https://images.unsplash.com/photo-1618354691551-44de113f0164?auto=format&fit=crop&w=600&q=80',
  'Scrubbing Sponge (5-pack)': 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=600&q=80',
  'Laundry Detergent 2kg': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
  'Rubber Gloves (2 pairs)': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',

  // ── Furniture ─────────────────────────────────────────────────────────────
  'Ergonomic Office Chair': 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80',
  'Under-Desk Cable Manager': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
  'Height-Adjustable Standing Desk': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80',
  'Wooden Book Shelf (5-tier)': 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=600&q=80',
  'Monitor Stand with Drawer': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80',
  'Sofa 3-Seater Fabric': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
  'Filing Cabinet 3-Drawer': 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  'Folding Study Table': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80',
  'Office Desk Organiser': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
  'Locker Cabinet 6-Door': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  'Whiteboard 4×3 Feet': 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=600&q=80',
  'Round Conference Table': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
  'Visitor Chair Padded': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80',
  'Office Partition Screen': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80',
  'Stackable Storage Cabinet': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80',
  'Adjustable Monitor Arm': 'https://images.unsplash.com/photo-1593640408182-31c228d9d4ab?auto=format&fit=crop&w=600&q=80',
  'Footrest Under Desk': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80',
  'Anti-Fatigue Mat': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  'Wall Mounted Shelf Set (3)': 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=600&q=80',
  'Drawer Pedestal Unit': 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
};

// Keyword mapping for automatic fallback by title
const KEYWORD_IMAGE_MAP = [
  { keywords: ['pen', 'pencil', 'marker', 'ink'], url: 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['notebook', 'notepad', 'paper', 'diary', 'book'], url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['sticky', 'notes', 'post-it'], url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['folder', 'file', 'binder', 'organizer'], url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['stapler', 'pin', 'clip'], url: 'https://images.unsplash.com/photo-1590247819200-16176cd17a1e?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['highlighter', 'fluorescent'], url: 'https://images.unsplash.com/photo-1572965733001-b7e4c5e9a44e?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['scissors', 'tape', 'correction', 'ruler'], url: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['chip', 'lays', 'crisp', 'wafer', 'pringles'], url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['biscuit', 'cookie', 'bakery', 'marie', 'digestive'], url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['namkeen', 'snack', 'mixture', 'bites', 'kurkure'], url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281352?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['chocolate', 'cocoa', 'candy', 'sweet'], url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['protein', 'energy', 'bar', 'granola'], url: 'https://images.unsplash.com/photo-1622484210800-8851b576f9d2?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['peanut', 'nut', 'cashew', 'almond', 'dry fruit'], url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['popcorn', 'corn'], url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['noodle', 'maggi', 'soup', 'instant'], url: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['coffee', 'nescafe', 'brew', 'espresso', 'caffeine', 'cappuccino', 'starbucks'], url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['tea', 'lipton', 'green tea', 'chai', 'chamomile', 'tetley'], url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['juice', 'tropicana', 'fruit drink', 'mango', 'orange', 'frooti', 'minute maid'], url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['water', 'mineral'], url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['energy drink', 'red bull', 'cola', 'sprite', 'soda', 'coca'], url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['malt', 'horlicks', 'ovaltine', 'glucon', 'shake', 'protein powder'], url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['coconut'], url: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['cable', 'usb', 'charger', 'wire', 'cord', 'hdmi'], url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['battery', 'batteries', 'cell', 'power'], url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['mouse', 'keyboard', 'device', 'gadget'], url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['hub', 'port', 'adapter', 'dongle', 'type-c'], url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['power bank', 'powerbank', 'portable charger'], url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['earbuds', 'headphone', 'headset', 'earbud'], url: 'https://images.unsplash.com/photo-1590658165737-15a047b7c471?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['speaker', 'bluetooth'], url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['lamp', 'light', 'led'], url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['webcam', 'camera', 'web cam'], url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['fan', 'desk fan'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['wireless charger', 'charging pad'], url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['plug', 'smart plug', 'wi-fi plug'], url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['sanitizer', 'hand sanitizer', 'soap', 'hygiene'], url: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['cleaner', 'floor', 'detergent', 'spray', 'wash', 'disinfectant'], url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['tissue', 'wipe', 'towel', 'toilet paper', 'paper towel'], url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['mop', 'broom', 'dustpan', 'sponge', 'scrub'], url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['glove', 'rubber'], url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['freshener', 'air freshener', 'fragrance'], url: 'https://images.unsplash.com/photo-1618354691551-44de113f0164?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['laundry', 'washing', 'detergent powder'], url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['chair', 'seat', 'seating'], url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['desk', 'table', 'standing desk', 'workstation'], url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['shelf', 'shelves', 'bookshelf', 'rack'], url: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['cabinet', 'locker', 'drawer', 'storage'], url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['sofa', 'couch'], url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['whiteboard', 'board', 'notice board', 'cork'], url: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['monitor stand', 'monitor arm', 'laptop stand'], url: 'https://images.unsplash.com/photo-1593640408182-31c228d9d4ab?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['mat', 'footrest', 'anti-fatigue', 'floor mat'], url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['conference', 'meeting table', 'round table'], url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['partition', 'divider', 'screen', 'panel'], url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80' },
];

const CATEGORY_FALLBACK_MAP = {
  'Stationery': 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=600&q=80',
  'Snacks': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
  'Beverages': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  'Electronics': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
  'Cleaning': 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=600&q=80',
  'Furniture': 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80',
};

export const getProductImage = (product) => {
  if (!product) return DEFAULT_FALLBACK_IMAGE;

  // 1. If product has custom image set
  if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
    const img = product.image.trim();
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    // Relative upload path from backend server (express backend running on port 5000)
    if (img.startsWith('/uploads') || img.startsWith('uploads')) {
      return img.startsWith('/') ? img : `/${img}`;
    }
    return img.startsWith('/') ? img : `/${img}`;
  }

  // 2. Exact product name match
  if (product.name && PRODUCT_IMAGE_MAP[product.name]) {
    return PRODUCT_IMAGE_MAP[product.name];
  }

  // 3. Keyword matching by product name
  if (product.name) {
    const nameLower = product.name.toLowerCase();
    for (const item of KEYWORD_IMAGE_MAP) {
      if (item.keywords.some(k => nameLower.includes(k))) {
        return item.url;
      }
    }
  }

  // 4. Category match
  const cat = product.category_name || product.category;
  if (cat) {
    const catLower = cat.toLowerCase();
    for (const [key, url] of Object.entries(CATEGORY_FALLBACK_MAP)) {
      if (catLower.includes(key.toLowerCase())) {
        return url;
      }
    }
  }

  // 5. Default fallback
  return DEFAULT_FALLBACK_IMAGE;
};

// Automatic error handler for broken or failing image URLs
export const handleImageError = (e, product) => {
  e.target.onerror = null;
  // If product category exists, try category fallback first, else default
  const cat = product?.category_name || product?.category;
  if (cat && CATEGORY_FALLBACK_MAP[cat]) {
    e.target.src = CATEGORY_FALLBACK_MAP[cat];
  } else {
    e.target.src = DEFAULT_FALLBACK_IMAGE;
  }
};
