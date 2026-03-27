CREATE TABLE IF NOT EXISTS tenants (
  tenant_id  TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  product_id  TEXT NOT NULL,
  tenant_id   TEXT NOT NULL REFERENCES tenants(tenant_id),
  data        JSONB NOT NULL,
  PRIMARY KEY (product_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS media_buys (
  media_buy_id TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL REFERENCES tenants(tenant_id),
  data         JSONB NOT NULL,
  is_canceled  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
