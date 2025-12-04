-- Tabla para Perfil Financiero del Usuario
CREATE TABLE IF NOT EXISTS user_financial_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Datos Personales
    age INTEGER,
    marital_status VARCHAR(20), -- 'single', 'married', 'divorced', 'widowed'
    num_dependents INTEGER DEFAULT 0,
    num_children INTEGER DEFAULT 0,
    
    -- Situación Laboral
    work_schedule VARCHAR(20), -- 'full_time', 'part_time', 'freelance', 'retired', 'student'
    monthly_income_range VARCHAR(20), -- 'low', 'medium', 'high', 'very_high'
    
    -- Estilo de Vida
    hobbies TEXT[], -- Array de hobbies
    main_expenses TEXT[], -- Gastos principales recurrentes
    
    -- Planes de Retiro
    retirement_age_goal INTEGER,
    retirement_lifestyle VARCHAR(20), -- 'modest', 'comfortable', 'luxurious'
    
    -- Perfil de Inversor
    risk_profile VARCHAR(20), -- 'conservative', 'moderate', 'aggressive'
    investment_experience VARCHAR(20), -- 'none', 'beginner', 'intermediate', 'advanced'
    
    -- Fondo de Emergencia
    has_emergency_fund BOOLEAN DEFAULT false,
    emergency_fund_months INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_age CHECK (age >= 18 AND age <= 120),
    CONSTRAINT valid_dependents CHECK (num_dependents >= 0),
    CONSTRAINT valid_children CHECK (num_children >= 0),
    CONSTRAINT valid_emergency_months CHECK (emergency_fund_months >= 0)
);

-- Tabla para Recomendaciones Financieras
CREATE TABLE IF NOT EXISTS financial_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tipo y Contenido
    recommendation_type VARCHAR(50) NOT NULL, -- 'budget_distribution', 'savings_goal', 'emergency_fund', 'debt_reduction', 'investment'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Prioridad y Estado
    priority VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'dismissed', 'completed'
    
    -- Datos Adicionales
    metadata JSONB, -- Datos específicos de cada tipo de recomendación
    
    -- Fechas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_priority CHECK (priority IN ('high', 'medium', 'low')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'dismissed', 'completed'))
);

-- Índices
CREATE INDEX idx_user_financial_profile_user_id ON user_financial_profile(user_id);
CREATE INDEX idx_financial_recommendations_user_id ON financial_recommendations(user_id);
CREATE INDEX idx_financial_recommendations_status ON financial_recommendations(status);
CREATE INDEX idx_financial_recommendations_priority ON financial_recommendations(priority);

-- Row Level Security
ALTER TABLE user_financial_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_recommendations ENABLE ROW LEVEL SECURITY;

-- Políticas para user_financial_profile
CREATE POLICY "Users can view own profile"
    ON user_financial_profile FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON user_financial_profile FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON user_financial_profile FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
    ON user_financial_profile FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para financial_recommendations
CREATE POLICY "Users can view own recommendations"
    ON financial_recommendations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
    ON financial_recommendations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
    ON financial_recommendations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
    ON financial_recommendations FOR DELETE
    USING (auth.uid() = user_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_user_financial_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_financial_profile_updated_at
    BEFORE UPDATE ON user_financial_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_user_financial_profile_updated_at();

-- Función para limpiar recomendaciones expiradas
CREATE OR REPLACE FUNCTION clean_expired_recommendations()
RETURNS void AS $$
BEGIN
    UPDATE financial_recommendations
    SET status = 'dismissed'
    WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql;
