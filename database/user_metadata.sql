-- ============================================
-- TABLA: user_metadata
-- Descripción: Almacena metadatos de usuarios para tracking y tutorial
-- ============================================

CREATE TABLE IF NOT EXISTS user_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  account_age_days INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (NOW() - created_at))::INTEGER
  ) STORED,
  has_completed_tutorial BOOLEAN DEFAULT FALSE,
  tutorial_completed_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  login_count INTEGER DEFAULT 1,
  is_new_user BOOLEAN GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (NOW() - created_at))::INTEGER <= 7
  ) STORED,
  preferences JSONB DEFAULT '{}'::JSONB,
  UNIQUE(user_id)
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_metadata_user_id ON user_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metadata_is_new ON user_metadata(is_new_user);
CREATE INDEX IF NOT EXISTS idx_user_metadata_created_at ON user_metadata(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver solo sus propios metadatos
DROP POLICY IF EXISTS "Users can view own metadata" ON user_metadata;
CREATE POLICY "Users can view own metadata"
  ON user_metadata FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden insertar sus propios metadatos
DROP POLICY IF EXISTS "Users can insert own metadata" ON user_metadata;
CREATE POLICY "Users can insert own metadata"
  ON user_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden actualizar sus propios metadatos
DROP POLICY IF EXISTS "Users can update own metadata" ON user_metadata;
CREATE POLICY "Users can update own metadata"
  ON user_metadata FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCIÓN: Crear metadata al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION create_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_metadata (user_id, created_at, login_count)
  VALUES (NEW.id, NOW(), 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Crear metadata automáticamente
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_metadata();

-- ============================================
-- FUNCIÓN: Incrementar contador de login
-- ============================================
CREATE OR REPLACE FUNCTION increment_login_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE user_metadata
  SET 
    last_login_at = NOW(),
    login_count = login_count + 1
  WHERE user_id = p_user_id
  RETURNING login_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN: Marcar tutorial como completado
-- ============================================
CREATE OR REPLACE FUNCTION mark_tutorial_complete(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_metadata
  SET 
    has_completed_tutorial = TRUE,
    tutorial_completed_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN: Obtener estadísticas de usuario
-- ============================================
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  account_age_days INTEGER,
  login_count INTEGER,
  is_new_user BOOLEAN,
  has_completed_tutorial BOOLEAN,
  days_since_tutorial INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    um.account_age_days,
    um.login_count,
    um.is_new_user,
    um.has_completed_tutorial,
    CASE 
      WHEN um.tutorial_completed_at IS NOT NULL 
      THEN EXTRACT(DAY FROM (NOW() - um.tutorial_completed_at))::INTEGER
      ELSE NULL
    END as days_since_tutorial
  FROM user_metadata um
  WHERE um.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE user_metadata IS 'Almacena metadatos de usuarios para tracking, tutorial y preferencias';
COMMENT ON COLUMN user_metadata.account_age_days IS 'Edad de la cuenta en días (calculado automáticamente)';
COMMENT ON COLUMN user_metadata.is_new_user IS 'TRUE si la cuenta tiene menos de 7 días';
COMMENT ON COLUMN user_metadata.preferences IS 'Preferencias del usuario en formato JSON';

-- ============================================
-- DATOS DE EJEMPLO (Opcional - Solo para testing)
-- ============================================
-- Descomentar para crear datos de prueba
-- INSERT INTO user_metadata (user_id, created_at, has_completed_tutorial, login_count)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days', FALSE, 5),
--   ('00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '10 days', TRUE, 15);
