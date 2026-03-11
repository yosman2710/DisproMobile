-- 1. TABLA PERFILES (Sincronizada con auth.users)
CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cedula BIGINT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('empleado', 'cajero', 'admin')) NOT NULL,
  saldo_actual DECIMAL(12, 2) DEFAULT 0.00,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 2. CATÁLOGO DE BENEFICIOS
CREATE TABLE public.beneficios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  costo_moneda DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0
);

ALTER TABLE public.beneficios ENABLE ROW LEVEL SECURITY;

-- 3. QR TOKENS (Tokens de uso único)
CREATE TABLE public.qr_tokens (
  id SERIAL PRIMARY KEY,
  perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
  token_auth UUID DEFAULT gen_random_uuid() UNIQUE,
  expira_at TIMESTAMP WITH TIME ZONE NOT NULL,
  usado BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;

-- 4. TRANSACCIONES
CREATE TABLE public.transacciones (
  id SERIAL PRIMARY KEY,
  perfil_id UUID REFERENCES public.perfiles(id), -- A quién se le descuenta/suma
  ejecutor_id UUID REFERENCES public.perfiles(id), -- Quién procesó el canje
  tipo TEXT CHECK (tipo IN ('deposito', 'canje')),
  monto_total DECIMAL(12, 2) NOT NULL,
  motivo TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;

-- 5. DETALLE DEL CANJE (Para saber qué productos se llevó)
CREATE TABLE public.detalle_transaccion (
    id SERIAL PRIMARY KEY,
    transaccion_id INT REFERENCES public.transacciones(id) ON DELETE CASCADE,
    beneficio_id INT REFERENCES public.beneficios(id),
    cantidad INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

ALTER TABLE public.detalle_transaccion ENABLE ROW LEVEL SECURITY;

-- Función de sincronización
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, cedula, nombre, rol)
  VALUES (
    NEW.id, 
    (NEW.raw_user_meta_data->>'cedula')::BIGINT,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'rol'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de sincronización
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Función de actualización de saldo
CREATE OR REPLACE FUNCTION public.gestionar_saldo_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Si es un canje, validamos saldo y restamos
  IF (NEW.tipo = 'canje') THEN
    IF (SELECT saldo_actual FROM public.perfiles WHERE id = NEW.perfil_id) < NEW.monto_total THEN
      RAISE EXCEPTION 'Saldo insuficiente para esta transacción.';
    END IF;
    UPDATE public.perfiles SET saldo_actual = saldo_actual - NEW.monto_total WHERE id = NEW.perfil_id;
  
  -- Si es un depósito, sumamos
  ELSIF (NEW.tipo = 'deposito') THEN
    UPDATE public.perfiles SET saldo_actual = saldo_actual + NEW.monto_total WHERE id = NEW.perfil_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de transacciones
CREATE TRIGGER trg_actualizar_saldo
AFTER INSERT ON public.transacciones
FOR EACH ROW EXECUTE PROCEDURE public.gestionar_saldo_trigger();

-- Función para realizar canje seguro
CREATE OR REPLACE FUNCTION public.realizar_canje_seguro(
    p_token UUID,
    p_cajero_id UUID,
    p_monto_total DECIMAL,
    p_motivo TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_perfil_id UUID;
BEGIN
    -- 1. Validar el QR (que exista, no esté usado y no haya expirado)
    SELECT perfil_id INTO v_perfil_id
    FROM public.qr_tokens
    WHERE token_auth = p_token 
      AND usado = FALSE 
      AND expira_at > NOW();

    IF v_perfil_id IS NULL THEN
        RAISE EXCEPTION 'Código QR inválido, expirado o ya utilizado.';
    END IF;

    -- 2. Registrar la transacción (dispara 'trg_actualizar_saldo' automáticamente)
    INSERT INTO public.transacciones (perfil_id, ejecutor_id, tipo, monto_total, motivo)
    VALUES (v_perfil_id, p_cajero_id, 'canje', p_monto_total, p_motivo);

    -- 3. Marcar el token como usado
    UPDATE public.qr_tokens SET usado = TRUE WHERE token_auth = p_token;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
