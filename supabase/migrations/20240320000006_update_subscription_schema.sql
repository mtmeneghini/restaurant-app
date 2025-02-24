-- Add trial fields to restaurants table
ALTER TABLE restaurants 
ADD COLUMN is_trial BOOLEAN DEFAULT FALSE,
ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE;

-- Create custom features table
CREATE TABLE custom_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL
);

-- Create restaurant custom features table
CREATE TABLE restaurant_custom_features (
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES custom_features(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    PRIMARY KEY (restaurant_id, feature_id)
);

-- Insert default custom features
INSERT INTO custom_features (name, description) VALUES
    ('Integração iFood', 'Integração completa com a plataforma iFood para gerenciamento de pedidos'),
    ('Integração Rappi', 'Integração completa com a plataforma Rappi para gerenciamento de pedidos'),
    ('Integração Uber Eats', 'Integração completa com a plataforma Uber Eats para gerenciamento de pedidos'),
    ('API Personalizada', 'API personalizada para integração com sistemas próprios'),
    ('Suporte 24/7', 'Suporte técnico disponível 24 horas por dia, 7 dias por semana'),
    ('Treinamento Presencial', 'Sessões de treinamento presencial para sua equipe'),
    ('Relatórios Personalizados', 'Relatórios e dashboards personalizados para suas necessidades específicas'),
    ('Backup Dedicado', 'Servidor de backup dedicado para seus dados'),
    ('Multi-localização', 'Suporte para gerenciamento de múltiplas localizações/filiais'),
    ('Integrações Personalizadas', 'Desenvolvimento de integrações personalizadas com outros sistemas');

-- Add triggers for updated_at
CREATE TRIGGER update_custom_features_updated_at
    BEFORE UPDATE ON custom_features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_custom_features_updated_at
    BEFORE UPDATE ON restaurant_custom_features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update get_subscription_details function to include trial info
CREATE OR REPLACE FUNCTION get_subscription_details(p_user_id UUID)
RETURNS TABLE (
    tier TEXT,
    status TEXT,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN,
    billing_period billing_period,
    is_trial BOOLEAN,
    trial_end TIMESTAMP,
    custom_features JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.subscription_tier,
        COALESCE(s.attrs->>'status', 'inactive'),
        (s.attrs->>'current_period_end')::TIMESTAMP,
        (s.attrs->>'cancel_at_period_end')::BOOLEAN,
        r.billing_period,
        r.is_trial,
        r.trial_end,
        COALESCE(
            (
                SELECT json_agg(json_build_object(
                    'id', cf.id,
                    'name', cf.name,
                    'description', cf.description,
                    'enabled', rcf.enabled
                ))
                FROM restaurant_custom_features rcf
                JOIN custom_features cf ON cf.id = rcf.feature_id
                WHERE rcf.restaurant_id = r.id
            ),
            '[]'::json
        ) as custom_features
    FROM restaurants r
    LEFT JOIN stripe.subscriptions s ON s.id = r.stripe_subscription_id
    WHERE r.user_id = p_user_id;
END;
$$; 