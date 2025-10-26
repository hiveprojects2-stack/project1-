/*
  # Create Transactions Management Tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `seller_id` (text) - references the seller
      - `name` (text) - product name
      - `category` (text) - product category
      - `price` (decimal) - product price
      - `vat_percentage` (integer) - VAT rate for product
      - `stock` (integer) - stock quantity
      - `is_active` (boolean) - active status
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `seller_id` (text) - references the seller
      - `transaction_code` (text, unique) - transaction identifier
      - `transaction_type` (text) - 'automatic' or 'manual'
      - `buyer_name` (text) - buyer name (for manual entries)
      - `subtotal` (decimal) - subtotal amount
      - `vat_amount` (decimal) - total VAT
      - `total_amount` (decimal) - total amount
      - `status` (text) - 'pending', 'completed', 'cancelled'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transaction_items`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid) - references transactions
      - `product_id` (uuid) - references products
      - `product_name` (text) - snapshot of product name
      - `quantity` (integer) - quantity purchased
      - `unit_price` (decimal) - price per unit at time of sale
      - `vat_percentage` (integer) - VAT rate at time of sale
      - `vat_amount` (decimal) - VAT for this item
      - `total_price` (decimal) - total for this item
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    
  3. Important Notes
    - All tables have timestamps for auditing
    - Transaction items store product snapshots for historical accuracy
    - VAT calculations are stored for transparency
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  price decimal(10, 2) NOT NULL,
  vat_percentage integer NOT NULL DEFAULT 16,
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id text NOT NULL,
  transaction_code text UNIQUE NOT NULL,
  transaction_type text NOT NULL DEFAULT 'automatic',
  buyer_name text,
  subtotal decimal(10, 2) NOT NULL,
  vat_amount decimal(10, 2) NOT NULL,
  total_amount decimal(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('automatic', 'manual')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  vat_percentage integer NOT NULL,
  vat_amount decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_code ON transactions(transaction_code);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON transaction_items(product_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  TO authenticated
  USING (seller_id = current_user);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = current_user);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  TO authenticated
  USING (seller_id = current_user)
  WITH CHECK (seller_id = current_user);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  TO authenticated
  USING (seller_id = current_user);

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (seller_id = current_user);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = current_user);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (seller_id = current_user)
  WITH CHECK (seller_id = current_user);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (seller_id = current_user);

-- RLS Policies for transaction_items table
CREATE POLICY "Users can view items from their transactions"
  ON transaction_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_items.transaction_id
      AND transactions.seller_id = current_user
    )
  );

CREATE POLICY "Users can insert items to their transactions"
  ON transaction_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_items.transaction_id
      AND transactions.seller_id = current_user
    )
  );

CREATE POLICY "Users can update items from their transactions"
  ON transaction_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_items.transaction_id
      AND transactions.seller_id = current_user
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_items.transaction_id
      AND transactions.seller_id = current_user
    )
  );

CREATE POLICY "Users can delete items from their transactions"
  ON transaction_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_items.transaction_id
      AND transactions.seller_id = current_user
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();