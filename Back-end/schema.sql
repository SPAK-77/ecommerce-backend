-- E-Store Database Schema
-- Run this file in MySQL to initialize the database

CREATE DATABASE IF NOT EXISTS estore;
USE estore;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  phone VARCHAR(20),
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  image VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 4.00,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'cod',
  address_snapshot TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(200),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- Seed Data
-- =============================================

-- Admin user (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@estore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Categories
INSERT INTO categories (name, icon, description) VALUES
('Stationery', '✏️', 'Pens, notebooks, files and all office stationery'),
('Snacks', '🍪', 'Chips, biscuits, namkeen and light bites'),
('Beverages', '☕', 'Tea, coffee, juices and cold drinks'),
('Electronics', '💡', 'Batteries, cables, adapters and gadgets'),
('Cleaning', '🧹', 'Cleaning supplies, detergents and hygiene products'),
('Furniture', '🪑', 'Chairs, desks and storage solutions')
ON DUPLICATE KEY UPDATE id=id;

-- Products
INSERT INTO products (category_id, name, description, price, stock, image, is_featured, rating, reviews_count) VALUES

-- ── Beverages (category_id = 3) ── 20 products ──────────────────────────
(3, 'Nescafé Classic (200g)', 'Instant coffee for the perfect office brew', 450.00, 120, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', TRUE, 4.6, 445),
(3, 'Lipton Green Tea (100 bags)', 'Premium green tea bags, pack of 100', 380.00, 90, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 234),
(3, 'Tropicana Mixed Fruit (6-pack)', 'Mixed fruit juice tetra packs, 200ml each', 270.00, 150, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 167),
(3, 'Cold Coffee Sachets (20)', 'Ready-mix cold coffee sachets, rich and creamy', 290.00, 100, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80', TRUE, 4.5, 198),
(3, 'Mineral Water Bottles (24-pack)', 'Packaged drinking water, 500ml each', 350.00, 300, 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80', FALSE, 4.0, 89),
(3, 'Red Bull Energy Drink (24-pack)', 'Original energy drink, 250ml cans, pack of 24', 1800.00, 60, 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=600&q=80', TRUE, 4.7, 356),
(3, 'Bru Cappuccino Sachets (30)', 'Frothy cappuccino instant sachets, pack of 30', 320.00, 80, 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 142),
(3, 'Minute Maid Orange (1L, 6-pack)', 'Fresh orange juice cartons, 1L each, pack of 6', 540.00, 70, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 98),
(3, 'Ovaltine Chocolate Malt (500g)', 'Classic malt drink powder for hot and cold beverages', 360.00, 90, 'https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 123),
(3, 'Tetley Chamomile Tea (50 bags)', 'Soothing chamomile herbal tea, 50 bags', 280.00, 110, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 176),
(3, 'Coca-Cola Cans (330ml × 12)', 'Chilled Coca-Cola cans, pack of 12 for office parties', 600.00, 200, 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80', TRUE, 4.6, 412),
(3, 'Horlicks Classic (500g)', 'Nourishing malt health drink for morning energy', 290.00, 85, 'https://images.unsplash.com/photo-1608138404239-d2e2b0f4e5e9?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 87),
(3, 'Iced Lemon Tea Sachets (20)', 'Refreshing iced lemon tea powder sachets', 180.00, 130, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 105),
(3, 'Protein Shake Powder (1kg)', 'Whey protein shake, vanilla flavor, 1kg tub', 1500.00, 40, 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 211),
(3, 'Coconut Water Tetra Pack (6-pack)', 'Natural tender coconut water, 200ml each', 300.00, 120, 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 134),
(3, 'Sprite Lemon Soda (330ml × 12)', 'Chilled Sprite lemon-lime soda cans, pack of 12', 540.00, 160, 'https://images.unsplash.com/photo-1632765854612-9b02b6ec2b15?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 98),
(3, 'Starbucks Via Instant (12 sachets)', 'Starbucks signature roast instant coffee sachets', 950.00, 55, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', TRUE, 4.8, 289),
(3, 'Masala Chai Premix (500g)', 'Aromatic spiced chai premix for 50 cups', 240.00, 100, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 167),
(3, 'Mango Frooti Tetra (200ml × 12)', 'India''s favourite mango drink, 12-pack', 360.00, 180, 'https://images.unsplash.com/photo-1560963873-58a7a593f80e?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 143),
(3, 'Glucon-D Orange (1kg)', 'Instant glucose energy drink powder, orange flavor', 220.00, 95, 'https://images.unsplash.com/photo-1503327843880-c19b0e1e1c94?auto=format&fit=crop&w=600&q=80', FALSE, 4.0, 76),

-- ── Cleaning (category_id = 5) ── 20 products ───────────────────────────
(5, 'Hand Sanitizer 500ml', 'WHO-formulated hand sanitizer, 500ml pump bottle', 180.00, 200, 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=600&q=80', TRUE, 4.6, 567),
(5, 'Floor Cleaner 1L', 'Multi-surface floor cleaner, pine fragrance', 120.00, 150, 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 234),
(5, 'Tissue Box (200 pulls)', 'Soft facial tissues, 2-ply, 200 pulls', 85.00, 300, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 189),
(5, 'Disinfectant Spray 500ml', 'Hospital-grade surface disinfectant spray kills 99.9% germs', 220.00, 160, 'https://images.unsplash.com/photo-1585837434704-d5f88fcaab3c?auto=format&fit=crop&w=600&q=80', TRUE, 4.7, 345),
(5, 'Microfibre Cleaning Cloths (5-pack)', 'Ultra-soft microfibre cloths for screens and surfaces', 195.00, 120, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 123),
(5, 'Toilet Bowl Cleaner 750ml', 'Powerful toilet cleaner with lime scale remover', 110.00, 180, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 98),
(5, 'Liquid Handwash Refill 750ml', 'Moisturising antibacterial handwash, floral fragrance', 135.00, 200, 'https://images.unsplash.com/photo-1584499165997-ba84fc2f7b66?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 214),
(5, 'Glass Cleaner Spray 500ml', 'Streak-free glass and mirror cleaner spray', 140.00, 140, 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 87),
(5, 'Wet Wipes Pack (80 sheets)', 'Anti-bacterial desk and surface wet wipes', 95.00, 250, 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&w=600&q=80', FALSE, 4.6, 302),
(5, 'Dustbin Liners 60L (50-pack)', 'Heavy-duty garbage bags for office bins', 180.00, 100, 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=600&q=80', FALSE, 4.0, 145),
(5, 'Toilet Paper Roll (12-pack)', 'Soft 3-ply toilet rolls, 220 sheets per roll', 245.00, 220, 'https://images.unsplash.com/photo-1585737904040-f6ad3e3e4b47?auto=format&fit=crop&w=600&q=80', TRUE, 4.5, 389),
(5, 'All-Purpose Cleaner 2L', 'Concentrated all-purpose liquid cleaner, lemon fresh', 250.00, 90, 'https://images.unsplash.com/photo-1585837424907-8a82dc7ca01d?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 156),
(5, 'Broom + Dustpan Set', 'Ergonomic handle broom with matching dustpan', 320.00, 60, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 78),
(5, 'Dish Wash Liquid 1L', 'Grease-cutting dish wash liquid, lemon fragrance', 125.00, 170, 'https://images.unsplash.com/photo-1585840917936-9e1f07c02df1?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 112),
(5, 'Paper Towel Roll (6-pack)', 'Absorbent kitchen paper towels, 2-ply, pack of 6', 285.00, 130, 'https://images.unsplash.com/photo-1585737574122-0fa56bb7d66b?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 94),
(5, 'Mop with Bucket Set', 'Spin mop with 360° rotating head and squeeze bucket', 950.00, 35, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', TRUE, 4.7, 234),
(5, 'Air Freshener Spray 300ml', 'Long-lasting room freshener, ocean breeze fragrance', 165.00, 180, 'https://images.unsplash.com/photo-1618354691551-44de113f0164?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 187),
(5, 'Scrubbing Sponge (5-pack)', 'Heavy duty double-sided scrubbing sponges', 80.00, 280, 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 134),
(5, 'Laundry Detergent 2kg', 'Top-load & front-load washing machine powder detergent', 390.00, 100, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 221),
(5, 'Rubber Gloves (2 pairs)', 'Heavy-duty kitchen rubber gloves, medium size', 110.00, 200, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 76),

-- ── Electronics (category_id = 4) ── 20 products ─────────────────────────
(4, 'USB-C Charging Cable', 'Braided USB-C cable, 1.5m length, fast charging', 299.00, 80, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 178),
(4, 'AA Batteries Pack (20)', 'Long-lasting alkaline batteries, pack of 20', 380.00, 120, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 234),
(4, 'Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 850.00, 50, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80', TRUE, 4.7, 312),
(4, 'USB Hub 4-Port', 'USB 3.0 hub with 4 ports for laptop expansion', 650.00, 60, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 145),
(4, 'Mechanical Keyboard', 'Compact TKL mechanical keyboard, blue switches', 2200.00, 30, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80', TRUE, 4.8, 421),
(4, 'Webcam 1080p Full HD', 'USB plug-and-play webcam with built-in mic', 1800.00, 40, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 198),
(4, 'Power Bank 20000mAh', 'Fast-charge power bank with dual USB-C output', 1500.00, 55, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80', TRUE, 4.6, 378),
(4, 'Noise Cancelling Earbuds', 'True wireless earbuds with active noise cancellation', 2800.00, 35, 'https://images.unsplash.com/photo-1590658165737-15a047b7c471?auto=format&fit=crop&w=600&q=80', TRUE, 4.7, 456),
(4, 'LED Desk Lamp', 'Touch-control dimmable LED desk lamp with USB port', 1100.00, 65, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 234),
(4, 'Laptop Stand Adjustable', 'Aluminium foldable laptop stand for ergonomic posture', 950.00, 75, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80', FALSE, 4.6, 287),
(4, 'Screen Cleaning Kit', 'LCD screen cleaner spray + microfibre cloth kit', 290.00, 120, 'https://images.unsplash.com/photo-1593640408182-31c228d9d4ab?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 112),
(4, 'Type-C Multi-port Adapter', '7-in-1 USB-C hub: HDMI, USB 3.0, SD card, ethernet', 1350.00, 50, 'https://images.unsplash.com/photo-1625065804765-07fa3f95b5e5?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 165),
(4, 'Wireless Charger Pad 15W', 'Qi-certified fast wireless charging pad for all devices', 890.00, 70, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 203),
(4, 'Bluetooth Speaker Compact', 'Portable Bluetooth 5.0 speaker, 8-hour battery', 1600.00, 45, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80', TRUE, 4.6, 332),
(4, 'USB Desk Fan', 'Quiet USB-powered mini desk fan with 3 speeds', 480.00, 90, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 89),
(4, 'Cable Organiser Kit', 'Reusable velcro cable ties and management clips, 30-pc set', 220.00, 140, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 97),
(4, 'HDMI Cable 2m', 'High-speed HDMI 2.0 cable, 4K @ 60Hz, 2m length', 350.00, 100, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 145),
(4, 'Smart Plug (Wi-Fi)', 'Wi-Fi smart plug with energy monitoring, voice control', 750.00, 60, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 178),
(4, 'AAA Batteries Pack (20)', 'Long-lasting alkaline AAA batteries for remotes and devices', 320.00, 110, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 112),
(4, 'USB Desk LED Light', 'Flexible gooseneck USB LED light for keyboard or reading', 380.00, 85, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 76),

-- ── Furniture (category_id = 6) ── 20 products ───────────────────────────
(6, 'Ergonomic Office Chair', 'Adjustable lumbar support, mesh back office chair', 8500.00, 20, 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80', TRUE, 4.8, 145),
(6, 'Under-Desk Cable Manager', 'Steel cable management tray for under desk mounting', 650.00, 40, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 78),
(6, 'Height-Adjustable Standing Desk', 'Electric sit-stand desk, 120×60cm, two-stage', 18500.00, 10, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80', TRUE, 4.9, 312),
(6, 'Wooden Book Shelf (5-tier)', '5-tier solid wood bookshelf for home or office', 5500.00, 15, 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=600&q=80', FALSE, 4.6, 89),
(6, 'Monitor Stand with Drawer', 'Bamboo monitor riser stand with USB hub and drawer', 1800.00, 30, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80', FALSE, 4.7, 167),
(6, 'Sofa 3-Seater Fabric', 'Modern 3-seater fabric sofa in grey for office lounge', 22000.00, 5, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', TRUE, 4.8, 234),
(6, 'Filing Cabinet 3-Drawer', 'Steel lockable filing cabinet with 3 drawers', 6500.00, 12, 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 56),
(6, 'Folding Study Table', 'Compact foldable study table with cup holder', 2800.00, 25, 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 112),
(6, 'Office Desk Organiser', 'Bamboo desk organiser with 6 compartments + pen holder', 850.00, 60, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 134),
(6, 'Locker Cabinet 6-Door', 'Metal employee locker cabinet with 6 individual locks', 9800.00, 8, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', FALSE, 4.6, 45),
(6, 'Whiteboard 4×3 Feet', 'Magnetic dry-erase whiteboard with aluminium frame', 3200.00, 18, 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=600&q=80', FALSE, 4.7, 98),
(6, 'Round Conference Table', '1.2m round meeting table in walnut finish', 15000.00, 6, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80', TRUE, 4.8, 67),
(6, 'Visitor Chair Padded', 'Cushioned visitor chair with chrome legs', 3500.00, 30, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 89),
(6, 'Office Partition Screen', 'Acoustic fabric office divider, 160×120cm', 4200.00, 10, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 34),
(6, 'Stackable Storage Cabinet', 'Modular plastic storage cabinet with 4 drawers', 2200.00, 22, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 76),
(6, 'Adjustable Monitor Arm', 'Single monitor arm with full motion articulation, VESA', 1600.00, 35, 'https://images.unsplash.com/photo-1593640408182-31c228d9d4ab?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 145),
(6, 'Footrest Under Desk', 'Ergonomic adjustable foot rest with massage surface', 780.00, 50, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 88),
(6, 'Anti-Fatigue Mat', 'Cushioned standing mat for standing desks, 90×60cm', 1200.00, 40, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', FALSE, 4.6, 112),
(6, 'Wall Mounted Shelf Set (3)', 'Floating wall shelves, rustic wood + black brackets', 1400.00, 28, 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 96),
(6, 'Drawer Pedestal Unit', '3-drawer mobile pedestal with lock, fits under desk', 4500.00, 14, 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 54),

-- ── Snacks (category_id = 2) ── 20 products ──────────────────────────────
(2, 'Lays Classic Chips (Pack of 6)', 'Classic salted potato chips, pack of 6 pouches', 180.00, 200, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80', TRUE, 4.4, 312),
(2, 'Assorted Biscuits Box', 'Mixed biscuits box - Marie, Parle-G, Digestive', 250.00, 150, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 98),
(2, 'Namkeen Mix (500g)', 'Spicy mixed namkeen for office snacking', 120.00, 180, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281352?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 145),
(2, 'Dark Chocolate Pack', 'Premium dark chocolate bars, pack of 4', 320.00, 80, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=600&q=80', TRUE, 4.8, 267),
(2, 'Protein Bar Box (12)', 'Assorted protein bars for energy boost', 680.00, 60, 'https://images.unsplash.com/photo-1622484210800-8851b576f9d2?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 89),
(2, 'Kurkure Masala Munch (5-pack)', 'Crunchy corn puff sticks with tangy masala coating', 150.00, 220, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 198),
(2, 'Roasted Peanuts (500g)', 'Salted & roasted premium peanuts in resealable pack', 95.00, 300, 'https://images.unsplash.com/photo-1601379760883-1bb497c558ca?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 134),
(2, 'Mixed Dry Fruits (250g)', 'Premium mixed dry fruits: cashews, almonds, raisins', 450.00, 90, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', TRUE, 4.7, 234),
(2, 'Digestive Marie Biscuits (3-pack)', 'Light wholemeal digestive biscuits, 3 packs', 130.00, 200, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', FALSE, 4.0, 78),
(2, 'Popcorn Ready-to-Eat (6-pack)', 'Butter flavoured microwave-ready popcorn bags', 210.00, 160, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 112),
(2, 'Granola Bars Box (15 bars)', 'Oat and honey granola bars, 15-piece box', 480.00, 70, 'https://images.unsplash.com/photo-1586952518485-11b180e92764?auto=format&fit=crop&w=600&q=80', TRUE, 4.6, 178),
(2, 'Masala Cashews (200g)', 'Spicy roasted cashews in resealable zip pouch', 280.00, 110, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 156),
(2, 'Rice Cakes Pack (5)', 'Light and crispy rice cakes, plain and lightly salted', 190.00, 130, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281352?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 67),
(2, 'Maggi Noodles (Pack of 12)', 'Classic masala instant noodles, pack of 12', 240.00, 250, 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80', TRUE, 4.5, 389),
(2, 'Pringles Original (3-pack)', 'Stackable potato crisps in iconic can, 3-pack', 390.00, 80, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80', FALSE, 4.6, 167),
(2, 'Cheese Crackers Pack', 'Cheesy baked crackers, 200g sharing pack', 175.00, 140, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 89),
(2, 'Trail Mix Adventure (400g)', 'Energy trail mix with nuts, seeds, berries & dark choc', 520.00, 65, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 123),
(2, 'Wafer Biscuits Vanilla (3-pack)', 'Crispy vanilla cream wafer rolls, 3 packs', 140.00, 190, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 56),
(2, 'Instant Soup Sachets (10)', 'Mixed vegetable instant soup sachets, pack of 10', 230.00, 120, 'https://images.unsplash.com/photo-1576158113928-4c240eaaf360?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 78),
(2, 'Sesame Snack Bars (10-pack)', 'Crunchy sesame seed brittle bars, pack of 10', 260.00, 100, 'https://images.unsplash.com/photo-1586952518485-11b180e92764?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 91),

-- ── Stationery (category_id = 1) ── 20 products ──────────────────────────
(1, 'Premium Ball Pen Pack (10)', 'Smooth writing ball pens, black ink, pack of 10', 120.00, 500, 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=600&q=80', TRUE, 4.5, 234),
(1, 'A4 Notepad (200 pages)', 'Ruled A4 notepad, 200 pages, spiral bound', 85.00, 300, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 89),
(1, 'Sticky Notes Pack', 'Colorful sticky notes, 5 colors, 100 sheets each', 150.00, 200, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80', TRUE, 4.7, 178),
(1, 'File Folder Set (5)', 'Cardboard file folders for document organization', 75.00, 400, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', FALSE, 4.0, 56),
(1, 'Whiteboard Markers', 'Dry erase markers, assorted colors, pack of 6', 180.00, 150, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 112),
(1, 'Stapler + 1000 Pins', 'Heavy duty stapler with 1000 staples', 245.00, 120, 'https://images.unsplash.com/photo-1590247819200-16176cd17a1e?auto=format&fit=crop&w=600&q=80', FALSE, 4.6, 67),
(1, 'Highlighter Marker Set (6)', 'Fluorescent highlighters in 6 assorted colors', 145.00, 250, 'https://images.unsplash.com/photo-1572965733001-b7e4c5e9a44e?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 134),
(1, 'Spiral Bound Diary (A5)', 'Hardcover spiral diary, undated, 200 pages, A5 size', 195.00, 180, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 112),
(1, 'Scissors Set (3 sizes)', 'Stainless steel scissors in 3 sizes for office and craft', 220.00, 130, 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 87),
(1, 'Transparent Tape Rolls (12)', 'Clear adhesive tape rolls, 18mm × 33m, pack of 12', 180.00, 200, 'https://images.unsplash.com/photo-1612204103590-b84f24c49e45?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 65),
(1, 'Gel Pen Set (20 colors)', 'Smooth writing gel pens in 20 vibrant colors', 340.00, 160, 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=600&q=80', TRUE, 4.8, 289),
(1, 'Document Binder (A4)', 'Hard cover document binder with 50-page capacity', 110.00, 220, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 45),
(1, 'Ruler + Set Square Kit', 'Clear acrylic 30cm ruler with 45° and 60° set squares', 95.00, 280, 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80', FALSE, 4.0, 38),
(1, 'Correction Tape (6-pack)', 'Easy-glide correction tape, 5mm × 8m, pack of 6', 210.00, 150, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', FALSE, 4.4, 78),
(1, 'Index Tab Dividers (10-set)', 'Colour-coded A4 index tab dividers for binders', 125.00, 190, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', FALSE, 4.2, 54),
(1, 'Mechanical Pencils Set (5)', 'Refillable 0.5mm mechanical pencils with lead refills', 265.00, 140, 'https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=600&q=80', FALSE, 4.6, 123),
(1, 'Letter Tray (3-tier)', 'Acrylic desktop letter tray for paper organisation', 380.00, 85, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', FALSE, 4.3, 67),
(1, 'Stamp Pad + Ink (3-color)', 'Re-inkable stamp pad with 3 ink bottles: red, blue, black', 165.00, 100, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', FALSE, 4.1, 42),
(1, 'Bubble Wrap Roll (5m)', 'Protective bubble wrap for packaging, 5m × 30cm roll', 120.00, 170, 'https://images.unsplash.com/photo-1612204103590-b84f24c49e45?auto=format&fit=crop&w=600&q=80', FALSE, 4.0, 34),
(1, 'Cork Notice Board (60×45cm)', 'Natural cork pin board with aluminium frame', 750.00, 60, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80', FALSE, 4.5, 89);
