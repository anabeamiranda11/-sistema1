import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const db = new Database("database.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    whatsapp TEXT,
    pix TEXT,
    role TEXT DEFAULT 'affiliate',
    balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    commission_rate REAL NOT NULL,
    purchase_url TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS affiliations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    affiliate_code TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id INTEGER,
    product_id INTEGER,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(affiliate_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id INTEGER,
    product_id INTEGER,
    amount REAL NOT NULL,
    commission REAL NOT NULL,
    status TEXT DEFAULT 'paid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(affiliate_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id INTEGER,
    product_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(affiliate_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    value TEXT
  );
`);

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Administrador",
    "admin@admin.com",
    "admin123",
    "admin"
  );
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // WebSocket broadcast helper
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  app.post("/api/register", (req, res) => {
    const { name, email, password, whatsapp, pix } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (name, email, password, whatsapp, pix) VALUES (?, ?, ?, ?, ?)").run(
        name, email, password, whatsapp, pix
      );
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      
      // Broadcast new affiliate to admins
      broadcast({
        type: "NEW_AFFILIATE",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          whatsapp: user.whatsapp,
          created_at: user.created_at
        }
      });

      res.json(user);
    } catch (e) {
      res.status(400).json({ error: "Email já cadastrado" });
    }
  });

  app.put("/api/admin/profile", (req, res) => {
    const { id, name, email, password } = req.body;
    db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ? AND role = 'admin'").run(
      name, email, password, id
    );
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    res.json(user);
  });

  // Admin: Users
  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare(`
      SELECT u.*, 
        (SELECT SUM(commission) FROM sales s WHERE s.affiliate_id = u.id) as total_sales
      FROM users u 
      WHERE u.role = 'affiliate'
    `).all();
    res.json(users);
  });

  app.put("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, password, whatsapp, pix, balance } = req.body;
    db.prepare("UPDATE users SET name = ?, email = ?, password = ?, whatsapp = ?, pix = ?, balance = ? WHERE id = ?").run(
      name, email, password, whatsapp, pix, balance, id
    );
    res.json({ success: true });
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/admin/users", (req, res) => {
    const { name, email, password, whatsapp, pix, balance } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (name, email, password, whatsapp, pix, balance) VALUES (?, ?, ?, ?, ?, ?)").run(
        name, email, password, whatsapp, pix, balance || 0
      );
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      res.json(user);
    } catch (e) {
      res.status(400).json({ error: "Email já cadastrado" });
    }
  });

  // Admin: Products
  app.get("/api/admin/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/admin/products", (req, res) => {
    const { name, description, price, commission_rate, purchase_url, image_url } = req.body;
    db.prepare("INSERT INTO products (name, description, price, commission_rate, purchase_url, image_url) VALUES (?, ?, ?, ?, ?, ?)").run(
      name, description, price, commission_rate, purchase_url, image_url
    );
    res.json({ success: true });
  });

  app.put("/api/admin/products/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, price, commission_rate, purchase_url, image_url } = req.body;
    db.prepare("UPDATE products SET name = ?, description = ?, price = ?, commission_rate = ?, purchase_url = ?, image_url = ? WHERE id = ?").run(
      name, description, price, commission_rate, purchase_url, image_url, id
    );
    res.json({ success: true });
  });

  app.delete("/api/admin/products/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Admin: Withdrawals
  app.get("/api/admin/withdrawals", (req, res) => {
    const withdrawals = db.prepare(`
      SELECT w.*, u.name as user_name, u.pix as user_pix 
      FROM withdrawals w 
      JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC
    `).all();
    res.json(withdrawals);
  });

  app.put("/api/admin/withdrawals/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE withdrawals SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  app.delete("/api/admin/withdrawals/:id", (req, res) => {
    const { id } = req.params;
    const withdrawal = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(id);
    if (withdrawal && withdrawal.status === 'pending') {
      // Refund balance if deleting a pending withdrawal
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(withdrawal.amount, withdrawal.user_id);
    }
    db.prepare("DELETE FROM withdrawals WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Admin: Stats
  app.get("/api/admin/stats", (req, res) => {
    const totalSales = db.prepare("SELECT SUM(amount) as total FROM sales").get().total || 0;
    const totalCommission = db.prepare("SELECT SUM(commission) as total FROM sales").get().total || 0;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'affiliate'").get().count;
    const totalLeads = db.prepare("SELECT COUNT(*) as count FROM leads").get().count;
    const pendingWithdrawals = db.prepare("SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'").get().count;
    res.json({ totalSales, totalCommission, totalUsers, totalLeads, pendingWithdrawals });
  });

  // Affiliate: Products & Affiliation
  app.get("/api/affiliate/products/:userId", (req, res) => {
    const { userId } = req.params;
    const products = db.prepare(`
      SELECT p.*, a.affiliate_code 
      FROM products p 
      LEFT JOIN affiliations a ON p.id = a.product_id AND a.user_id = ?
    `).all(userId);
    res.json(products);
  });

  app.post("/api/affiliate/affiliate", (req, res) => {
    const { userId, productId } = req.body;
    const code = Math.random().toString(36).substring(2, 8);
    db.prepare("INSERT INTO affiliations (user_id, product_id, affiliate_code) VALUES (?, ?, ?)").run(userId, productId, code);
    res.json({ code });
  });

  // Affiliate: Stats
  app.get("/api/affiliate/stats/:userId", (req, res) => {
    const { userId } = req.params;
    const balance = db.prepare("SELECT balance FROM users WHERE id = ?").get(userId).balance;
    const totalSales = db.prepare("SELECT SUM(commission) as total FROM sales WHERE affiliate_id = ?").get(userId).total || 0;
    const totalClicks = db.prepare("SELECT COUNT(*) as count FROM clicks WHERE affiliate_id = ?").get(userId).count;
    const totalLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE affiliate_id = ?").get(userId).count;
    
    // Performance data for charts (last 7 days)
    const performance = db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as clicks,
        (SELECT COUNT(*) FROM sales s WHERE s.affiliate_id = ? AND date(s.created_at) = date(c.created_at)) as sales
      FROM clicks c
      WHERE affiliate_id = ? AND created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at)
    `).all(userId, userId);

    const goal5k = db.prepare("SELECT value FROM settings WHERE key = 'goal_5k'").get()?.value || "5000";
    const goal10k = db.prepare("SELECT value FROM settings WHERE key = 'goal_10k'").get()?.value || "10000";
    const minWithdrawal = db.prepare("SELECT value FROM settings WHERE key = 'min_withdrawal'").get()?.value || "10";

    res.json({ balance, totalSales, totalClicks, totalLeads, performance, goals: { goal5k: parseFloat(goal5k), goal10k: parseFloat(goal10k) }, minWithdrawal: parseFloat(minWithdrawal) });
  });

  // Affiliate: Withdrawals
  app.get("/api/affiliate/withdrawals/:userId", (req, res) => {
    const { userId } = req.params;
    const withdrawals = db.prepare("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    res.json(withdrawals);
  });

  app.post("/api/affiliate/withdrawals", (req, res) => {
    const { userId, amount } = req.body;
    
    const minWithdrawalSetting = db.prepare("SELECT value FROM settings WHERE key = 'min_withdrawal'").get();
    const minWithdrawal = minWithdrawalSetting ? parseFloat(minWithdrawalSetting.value) : 10;

    if (amount < minWithdrawal) {
      return res.status(400).json({ error: `O valor mínimo para saque é R$ ${minWithdrawal.toFixed(2)}` });
    }

    const user = db.prepare("SELECT balance, name, pix FROM users WHERE id = ?").get(userId);
    if (user.balance >= amount) {
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, userId);
      const result = db.prepare("INSERT INTO withdrawals (user_id, amount) VALUES (?, ?)").run(userId, amount);
      
      // Broadcast new withdrawal to admins
      broadcast({
        type: "NEW_WITHDRAWAL",
        withdrawal: {
          id: result.lastInsertRowid,
          user_id: userId,
          amount,
          status: "pending",
          created_at: new Date().toISOString(),
          user_name: user.name,
          user_pix: user.pix
        }
      });

      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Saldo insuficiente" });
    }
  });

  // Public: Lead Capture & Click Tracking
  app.get("/api/public/product/:code", (req, res) => {
    const { code } = req.params;
    const affiliation = db.prepare(`
      SELECT a.*, p.name as product_name, p.description as product_desc, p.image_url, p.purchase_url
      FROM affiliations a
      JOIN products p ON a.product_id = p.id
      WHERE a.affiliate_code = ?
    `).get(code);
    
    if (affiliation) {
      // Track click
      db.prepare("INSERT INTO clicks (affiliate_id, product_id) VALUES (?, ?)").run(affiliation.user_id, affiliation.product_id);
      res.json(affiliation);
    } else {
      res.status(404).json({ error: "Link inválido" });
    }
  });

  app.post("/api/public/lead", (req, res) => {
    const { affiliateId, productId, name, whatsapp } = req.body;
    const result = db.prepare("INSERT INTO leads (affiliate_id, product_id, name, whatsapp) VALUES (?, ?, ?, ?)").run(
      affiliateId, productId, name, whatsapp
    );
    
    const lead = db.prepare(`
      SELECT l.*, u.name as affiliate_name, p.name as product_name
      FROM leads l
      JOIN users u ON l.affiliate_id = u.id
      JOIN products p ON l.product_id = p.id
      WHERE l.id = ?
    `).get(result.lastInsertRowid);

    // Broadcast new lead to admins
    broadcast({
      type: "NEW_LEAD",
      lead
    });

    res.json({ success: true });
  });

  // Admin: Sales
  app.get("/api/admin/sales", (req, res) => {
    const sales = db.prepare(`
      SELECT s.*, u.name as affiliate_name, p.name as product_name
      FROM sales s
      JOIN users u ON s.affiliate_id = u.id
      JOIN products p ON s.product_id = p.id
      ORDER BY s.created_at DESC
    `).all();
    res.json(sales);
  });

  app.post("/api/admin/sales", (req, res) => {
    const { affiliateId, productId, amount } = req.body;
    const product = db.prepare("SELECT commission_rate FROM products WHERE id = ?").get(productId);
    const commission = (amount * product.commission_rate) / 100;
    
    db.prepare("INSERT INTO sales (affiliate_id, product_id, amount, commission) VALUES (?, ?, ?, ?)").run(
      affiliateId, productId, amount, commission
    );
    
    // Update affiliate balance
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(commission, affiliateId);
    
    res.json({ success: true });
  });

  app.delete("/api/admin/sales/:id", (req, res) => {
    const { id } = req.params;
    const sale = db.prepare("SELECT * FROM sales WHERE id = ?").get(id);
    if (sale) {
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(sale.commission, sale.affiliate_id);
      db.prepare("DELETE FROM sales WHERE id = ?").run(id);
    }
    res.json({ success: true });
  });

  app.put("/api/admin/sales/:id", (req, res) => {
    const { id } = req.params;
    const { amount, commission } = req.body;
    
    const oldSale = db.prepare("SELECT * FROM sales WHERE id = ?").get(id);
    if (!oldSale) return res.status(404).json({ error: "Venda não encontrada" });

    // Calculate balance adjustment
    const commissionDiff = commission - oldSale.commission;

    // Update sale
    db.prepare("UPDATE sales SET amount = ?, commission = ? WHERE id = ?").run(amount, commission, id);
    
    // Update affiliate balance
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(commissionDiff, oldSale.affiliate_id);

    res.json({ success: true });
  });

  // Admin: Settings
  app.get("/api/admin/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    res.json(settings);
  });

  app.post("/api/admin/settings", (req, res) => {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
    res.json({ success: true });
  });

  // Admin: Leads
  app.get("/api/admin/leads", (req, res) => {
    const leads = db.prepare(`
      SELECT l.*, u.name as affiliate_name, p.name as product_name
      FROM leads l
      JOIN users u ON l.affiliate_id = u.id
      JOIN products p ON l.product_id = p.id
      ORDER BY l.created_at DESC
    `).all();
    res.json(leads);
  });

  app.put("/api/admin/leads/:id", (req, res) => {
    const { id } = req.params;
    const { name, whatsapp } = req.body;
    db.prepare("UPDATE leads SET name = ?, whatsapp = ? WHERE id = ?").run(name, whatsapp, id);
    res.json({ success: true });
  });

  app.delete("/api/admin/leads/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM leads WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Affiliate: Leads
  app.get("/api/affiliate/leads/:userId", (req, res) => {
    const { userId } = req.params;
    const leads = db.prepare(`
      SELECT l.*, p.name as product_name
      FROM leads l
      JOIN products p ON l.product_id = p.id
      WHERE l.affiliate_id = ?
      ORDER BY l.created_at DESC
    `).all(userId);
    res.json(leads);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
