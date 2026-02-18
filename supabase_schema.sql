-- ============================================================
-- 1. LIMPIEZA TOTAL (BORRAR TABLAS ANTIGUAS SI EXISTEN)
-- ============================================================
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.posters CASCADE;

-- ============================================================
-- 2. CREACIÓN DE LA TABLA DE POSTERS (CAMPAÑAS)
-- ============================================================
CREATE TABLE public.posters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Información Principal
    patient_name TEXT NOT NULL,
    condition TEXT,
    procedure TEXT,
    location TEXT,
    description TEXT,
    
    -- Datos de Pago (Zelle)
    zelle_email TEXT,
    zelle_holder TEXT,
    
    -- Datos de Pago (Pago Móvil)
    pago_movil_bank TEXT,
    pago_movil_phone TEXT,
    pago_movil_id TEXT,
    
    -- Contactos y Multimedia
    contact_phones TEXT[] DEFAULT '{}',
    photo_url TEXT,
    medical_report_url TEXT,
    thank_you_message TEXT DEFAULT '¡Gracias de todo corazón por tu aporte!',
    total_amount TEXT,
    
    -- Personalización Visual
    theme TEXT DEFAULT 'pink',
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. CREACIÓN DE LA TABLA DE DONACIONES (APORTES)
-- ============================================================
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poster_id UUID REFERENCES public.posters(id) ON DELETE CASCADE,
    donor_name TEXT DEFAULT 'Anónimo',
    amount NUMERIC NOT NULL,
    message TEXT,
    payment_method TEXT,
    proof_url TEXT, -- URL de la captura de pantalla del pago
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. CONFIGURACIÓN DE SEGURIDAD (RLS)
-- ============================================================

-- Habilitar RLS en ambas tablas
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA LA TABLA 'POSTERS'
-- Cualquier persona puede ver un poster si tiene el ID/Link
CREATE POLICY "Lectura pública de posters" 
ON public.posters FOR SELECT USING (true);

-- Cualquier persona puede crear un poster nuevo
CREATE POLICY "Creación pública de posters" 
ON public.posters FOR INSERT WITH CHECK (true);

-- Permite actualizar el poster (necesario para el flujo de edición)
CREATE POLICY "Actualización pública de posters" 
ON public.posters FOR UPDATE USING (true);

-- POLÍTICAS PARA LA TABLA 'DONATIONS'
-- Permite ver los aportes realizados a una campaña
CREATE POLICY "Lectura pública de donaciones" 
ON public.donations FOR SELECT USING (true);

-- Permite a los donantes registrar su aporte
CREATE POLICY "Registro público de donaciones" 
ON public.donations FOR INSERT WITH CHECK (true);

-- ============================================================
-- 5. NOTAS FINALES SOBRE ARCHIVOS (STORAGE)
-- ============================================================
-- No olvides crear estos dos "Buckets" en la sección STORAGE de Supabase:
-- 1. 'reports' -> Configúralo como PUBLIC (para los PDFs médicos).
-- 2. 'proofs'  -> Configúralo como PUBLIC (para las fotos de comprobantes).
--
-- Dentro de cada Bucket, en la pestaña "Policies", añade una política 
-- que permita INSERT y SELECT para usuarios anónimos.