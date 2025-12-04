-- Tabla para Metas Financieras
CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información básica de la meta
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) NOT NULL, -- 'savings', 'income', 'emergency_fund', 'specific_fund'
    
    -- Montos y progreso
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Fechas
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Estado
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    
    -- Categoría específica (opcional)
    category VARCHAR(50), -- 'health', 'hobbies', 'travel', 'education', etc.
    
    -- Configuración
    auto_contribute BOOLEAN DEFAULT false,
    contribution_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly'
    contribution_amount DECIMAL(15, 2),
    
    CONSTRAINT positive_target CHECK (target_amount > 0),
    CONSTRAINT valid_current CHECK (current_amount >= 0)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_financial_goals_status ON financial_goals(status);
CREATE INDEX idx_financial_goals_goal_type ON financial_goals(goal_type);

-- Row Level Security (RLS)
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias metas
CREATE POLICY "Users can view own goals"
    ON financial_goals FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias metas
CREATE POLICY "Users can insert own goals"
    ON financial_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias metas
CREATE POLICY "Users can update own goals"
    ON financial_goals FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias metas
CREATE POLICY "Users can delete own goals"
    ON financial_goals FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_financial_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER financial_goals_updated_at
    BEFORE UPDATE ON financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_goals_updated_at();

-- Trigger para marcar como completada automáticamente
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_amount >= NEW.target_amount AND NEW.status = 'active' THEN
        NEW.status = 'completed';
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_completion_check
    BEFORE UPDATE ON financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION check_goal_completion();
