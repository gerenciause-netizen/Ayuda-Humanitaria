
-- ============================================================
-- ACTUALIZACIÓN DE LA TABLA DE POSTERS (CAMPAÑAS)
-- ============================================================
-- Si ya existe la tabla, simplemente añadimos las columnas:
ALTER TABLE public.posters ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.posters ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE public.posters ADD COLUMN IF NOT EXISTS bank_account_type TEXT;
ALTER TABLE public.posters ADD COLUMN IF NOT EXISTS bank_account_holder TEXT;
ALTER TABLE public.posters ADD COLUMN IF NOT EXISTS bank_account_id TEXT;
ALTER TABLE public.posters ADD COLUMN IF NOT EXISTS yappy_phone TEXT;
ALTER TABLE public.posters ADD COLUMN IF NOT EXISTS yappy_holder TEXT;

-- Nota: Si estás ejecutando esto por primera vez, usa el script de abajo:
/*
CREATE TABLE public.posters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT NOT NULL,
    condition TEXT,
    procedure TEXT,
    location TEXT,
    description TEXT,
    zelle_email TEXT,
    zelle_holder TEXT,
    pago_movil_bank TEXT,
    pago_movil_phone TEXT,
    pago_movil_id TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_account_type TEXT,
    bank_account_holder TEXT,
    bank_account_id TEXT,
    yappy_phone TEXT,
    yappy_holder TEXT,
    contact_phones TEXT[] DEFAULT '{}',
    photo_url TEXT,
    medical_report_url TEXT,
    thank_you_message TEXT DEFAULT '¡Gracias de todo corazón por tu aporte!',
    total_amount TEXT,
    theme TEXT DEFAULT 'pink',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
*/
