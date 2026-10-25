-- ==============================================================================
-- PROJETO LAÇO — SCHEMA SUPABASE POSTGRESQL & POLÍTICAS DE SEGURANÇA (RLS)
-- ==============================================================================

-- 1. TABELA DE EVENTOS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'casamento',
    hosts TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location_name TEXT NOT NULL,
    location_address TEXT NOT NULL,
    maps_url TEXT,
    custom_message TEXT,
    extra_info TEXT,
    theme JSONB DEFAULT '{"primaryColor": "#722F37", "secondaryColor": "#EFE9DF", "accentColor": "#C69F54", "bgColor": "#FAF7F2", "preset": "editorial_botanical"}'::jsonb,
    rsvp_deadline DATE,
    allow_group_rsvp BOOLEAN DEFAULT TRUE,
    max_group_size INT DEFAULT 5,
    budget_limit NUMERIC(12, 2) DEFAULT 0.00,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE CONVIDADOS (RSVP & LISTA)
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'declined', 'pending')) DEFAULT 'pending',
    adults_count INT NOT NULL DEFAULT 1,
    children_count INT NOT NULL DEFAULT 0,
    notes TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE LISTA DE COMPRAS
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'alimentos',
    quantity_needed INT NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'un',
    quantity_bought INT NOT NULL DEFAULT 0,
    estimated_price NUMERIC(10, 2) DEFAULT 0.00,
    actual_price NUMERIC(10, 2) DEFAULT 0.00,
    is_purchased BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE DESPESAS E ORÇAMENTO
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'buffet',
    estimated_amount NUMERIC(12, 2) DEFAULT 0.00,
    actual_amount NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('planejado', 'pago', 'pendente')) DEFAULT 'pendente',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON public.guests(event_id);
CREATE INDEX IF NOT EXISTS idx_shopping_event_id ON public.shopping_items(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event_id ON public.expenses(event_id);

-- ==============================================================================
-- ATIVAÇÃO DO ROW LEVEL SECURITY (RLS) PARA PRIVACIDADE & LGPD
-- ==============================================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLÍTICAS: EVENTS
-- ------------------------------------------------------------------------------
-- Organizadores autenticados têm controle total sobre seus próprios eventos
CREATE POLICY "Organizadores gerenciam seus próprios eventos"
    ON public.events
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Público anônimo pode ler apenas eventos não arquivados (para renderizar o convite digital)
CREATE POLICY "Público pode visualizar convite ativo pelo slug"
    ON public.events
    FOR SELECT
    TO anon
    USING (is_archived = FALSE);

-- ------------------------------------------------------------------------------
-- POLÍTICAS: GUESTS (CONVIDADOS & RSVP)
-- ------------------------------------------------------------------------------
-- Organizadores podem gerenciar a lista de convidados dos seus eventos
CREATE POLICY "Organizadores gerenciam convidados dos seus eventos"
    ON public.guests
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = guests.event_id
            AND events.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = guests.event_id
            AND events.user_id = auth.uid()
        )
    );

-- Convidados anônimos podem inserir sua própria confirmação de presença (RSVP)
-- Mas NÃO podem listar ou ler os telefones e contatos de outros convidados!
CREATE POLICY "Convidado anônimo pode enviar confirmação RSVP"
    ON public.guests
    FOR INSERT
    TO anon
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = guests.event_id
            AND events.is_archived = FALSE
        )
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: SHOPPING_ITEMS & EXPENSES
-- ------------------------------------------------------------------------------
-- Apenas organizadores autenticados podem visualizar e alterar compras e orçamentos
CREATE POLICY "Organizadores gerenciam lista de compras"
    ON public.shopping_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = shopping_items.event_id
            AND events.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = shopping_items.event_id
            AND events.user_id = auth.uid()
        )
    );

CREATE POLICY "Organizadores gerenciam orçamento e despesas"
    ON public.expenses
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = expenses.event_id
            AND events.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = expenses.event_id
            AND events.user_id = auth.uid()
        )
    );
