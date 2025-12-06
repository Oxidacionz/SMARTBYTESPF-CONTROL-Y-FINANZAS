-- Tabla para almacenar tasas de cambio globales
-- Solo habrá una fila con id='global' que se actualiza

CREATE TABLE IF NOT EXISTS exchange_rates (
  id TEXT PRIMARY KEY DEFAULT 'global',
  usd_bcv DECIMAL(10, 2) NOT NULL DEFAULT 52.50,
  eur_usd DECIMAL(10, 4) NOT NULL DEFAULT 1.09,
  cop_usd DECIMAL(10, 2) NOT NULL DEFAULT 4200,
  binance_buy DECIMAL(10, 2) NOT NULL DEFAULT 52.80,
  binance_sell DECIMAL(10, 2) NOT NULL DEFAULT 52.20,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT, -- user_id de quien actualizó
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar valores iniciales
INSERT INTO exchange_rates (id, usd_bcv, eur_usd, cop_usd, binance_buy, binance_sell)
VALUES ('global', 52.50, 1.09, 4200, 52.80, 52.20)
ON CONFLICT (id) DO NOTHING;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_exchange_rates_updated 
ON exchange_rates(last_updated DESC);

-- RLS (Row Level Security)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer las tasas
CREATE POLICY "Anyone can read exchange rates"
ON exchange_rates FOR SELECT
TO authenticated, anon
USING (true);

-- Política: Solo usuarios autenticados pueden actualizar
CREATE POLICY "Authenticated users can update exchange rates"
ON exchange_rates FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Función para actualizar tasas automáticamente desde Railway
CREATE OR REPLACE FUNCTION update_exchange_rates_from_railway(
  p_usd_bcv DECIMAL,
  p_eur_usd DECIMAL,
  p_cop_usd DECIMAL,
  p_binance_buy DECIMAL,
  p_binance_sell DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE exchange_rates
  SET 
    usd_bcv = p_usd_bcv,
    eur_usd = p_eur_usd,
    cop_usd = p_cop_usd,
    binance_buy = p_binance_buy,
    binance_sell = p_binance_sell,
    last_updated = NOW()
  WHERE id = 'global';
END;
$$;

-- Comentarios
COMMENT ON TABLE exchange_rates IS 'Almacena las tasas de cambio globales actualizadas automáticamente';
COMMENT ON COLUMN exchange_rates.usd_bcv IS 'Tasa USD del BCV (Banco Central de Venezuela)';
COMMENT ON COLUMN exchange_rates.binance_buy IS 'Tasa de compra de Binance P2P';
COMMENT ON COLUMN exchange_rates.binance_sell IS 'Tasa de venta de Binance P2P';
