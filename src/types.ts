export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  whatsapp?: string;
  pix?: string;
  role: 'admin' | 'affiliate';
  balance: number;
  total_sales?: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  commission_rate: number;
  purchase_url: string;
  image_url: string;
  created_at: string;
  affiliate_code?: string;
}

export interface Lead {
  id: number;
  affiliate_id: number;
  product_id: number;
  name: string;
  whatsapp: string;
  created_at: string;
  affiliate_name?: string;
  product_name?: string;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  amount: number;
  status: 'pending' | 'analysis' | 'completed' | 'rejected';
  created_at: string;
  user_name?: string;
  user_pix?: string;
}

export interface Stats {
  totalSales: number;
  totalCommission: number;
  totalUsers: number;
  totalLeads: number;
  pendingWithdrawals: number;
}

export interface AffiliateStats {
  balance: number;
  totalSales: number;
  totalClicks: number;
  totalLeads: number;
  performance: {
    date: string;
    clicks: number;
    sales: number;
  }[];
  goals: {
    goal5k: number;
    goal10k: number;
  };
}
