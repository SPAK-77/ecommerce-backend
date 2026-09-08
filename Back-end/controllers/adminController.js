const db = require('../config/db');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [[{ total_products }]] = await db.execute('SELECT COUNT(*) as total_products FROM products');
    const [[{ total_users }]] = await db.execute('SELECT COUNT(*) as total_users FROM users WHERE role = "customer"');
    const [[{ total_orders }]] = await db.execute('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ total_revenue }]] = await db.execute('SELECT COALESCE(SUM(total), 0) as total_revenue FROM orders WHERE payment_status = "paid"');
    const [[{ pending_orders }]] = await db.execute('SELECT COUNT(*) as pending_orders FROM orders WHERE status = "pending"');
    const [[{ low_stock }]] = await db.execute('SELECT COUNT(*) as low_stock FROM products WHERE stock < 10');

    // Recent orders
    const [recent_orders] = await db.execute(
      `SELECT o.id, o.total, o.status, o.created_at, u.name as customer_name 
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5`
    );

    // Sales by category
    const [sales_by_category] = await db.execute(
      `SELECT c.name, SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       GROUP BY c.id, c.name ORDER BY revenue DESC`
    );

    return res.json({
      success: true,
      stats: { total_products, total_users, total_orders, total_revenue, pending_orders, low_stock },
      recent_orders,
      sales_by_category,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStats };
