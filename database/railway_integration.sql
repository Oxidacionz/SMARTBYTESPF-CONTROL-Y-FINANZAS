-- =====================================================
-- SMART BYTES - Railway Integration SQL
-- =====================================================
-- Ejecuta este SQL en Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Pega este código → Run
-- =====================================================

-- 1. Modificar tabla existente para soportar Railway
-- Eliminar constraint de user_id único para permitir registro global
ALTER TABLE exchange_rates DROP CONSTRAINT IF EXISTS exchange_rates_user_id_key;

-- 2. Crear registro especial para Railway (ID fijo)
-- Este es el registro que Railway actualizará automáticamente
INSERT INTO exchange_rates (
    id,
    user_id,
    usd_bcv,
    eur_bcv,
    usd_binance_buy,
    usd_binance_sell,
    is_global,
    last_updated
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID, -- ID fijo para Railway
    NULL,                                          -- Sin user_id (global)
    0,                                             -- Valores iniciales
    0,
    0,
    0,
    TRUE,                                          -- Marca como global
    NOW()
)
ON CONFLICT (id) DO UPDATE SET last_updated = NOW();

-- 3. Actualizar política de SELECT para permitir lectura pública
DROP POLICY IF EXISTS "Users can view own rates" ON exchange_rates;

CREATE POLICY "Users can view rates" ON exchange_rates 
FOR SELECT 
USING (
    auth.uid() = user_id  -- Usuarios ven sus propias tasas
    OR is_global = TRUE   -- Todos ven las tasas globales
    OR user_id IS NULL    -- Todos ven las tasas sin usuario (Railway)
);

-- 4. Crear política para que Railway pueda actualizar (usando Service Role Key)
CREATE POLICY "Service role can update global rates" ON exchange_rates
FOR UPDATE
USING (user_id IS NULL AND is_global = TRUE);

-- 5. Crear política para que Railway pueda insertar si no existe
CREATE POLICY "Service role can insert global rates" ON exchange_rates
FOR INSERT
WITH CHECK (user_id IS NULL AND is_global = TRUE);

-- 6. Crear índice para optimizar búsqueda del registro de Railway
CREATE INDEX IF NOT EXISTS idx_exchange_rates_railway 
ON exchange_rates(id) 
WHERE id = '00000000-0000-0000-0000-000000000001'::UUID;

-- 7. Crear una vista para facilitar el acceso a las tasas globales
CREATE OR REPLACE VIEW current_exchange_rates AS
SELECT 
    usd_bcv,
    eur_bcv,
    usd_binance_buy,
    usd_binance_sell,
    last_updated
FROM exchange_rates
WHERE id = '00000000-0000-0000-0000-000000000001'::UUID
AND is_global = TRUE
LIMIT 1;

-- 8. Dar permisos de lectura pública a la vista
GRANT SELECT ON current_exchange_rates TO anon, authenticated;

-- =====================================================
-- FUNCIÓN HELPER para obtener tasas actuales
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_rates()
RETURNS TABLE (
    usd_bcv DECIMAL(12, 4),
    eur_bcv DECIMAL(12, 4),
    usd_binance_buy DECIMAL(12, 4),
    usd_binance_sell DECIMAL(12, 4),
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.usd_bcv,
        er.eur_bcv,
        er.usd_binance_buy,
        er.usd_binance_sell,
        er.last_updated
    FROM exchange_rates er
    WHERE er.id = '00000000-0000-0000-0000-000000000001'::UUID
    AND er.is_global = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos de ejecución a todos
GRANT EXECUTE ON FUNCTION get_current_rates() TO anon, authenticated;

-- =====================================================
-- COMENTARIOS ACTUALIZADOS
-- =====================================================

COMMENT ON TABLE exchange_rates IS 'Tasas de cambio: globales (Railway) y personalizadas (usuarios)';
COMMENT ON COLUMN exchange_rates.is_global IS 'TRUE para tasas globales actualizadas por Railway';
COMMENT ON VIEW current_exchange_rates IS 'Vista de solo lectura con las tasas globales actuales de Railway';
COMMENT ON FUNCTION get_current_rates() IS 'Función helper para obtener las tasas globales actuales';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecuta esta query para verificar que todo funcionó:

SELECT 
    id,
    usd_bcv,
    eur_bcv,
    usd_binance_buy,
    usd_binance_sell,
    is_global,
    last_updated
FROM exchange_rates
WHERE id = '00000000-0000-0000-0000-000000000001'::UUID;

-- Deberías ver 1 registro con is_global = true

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
