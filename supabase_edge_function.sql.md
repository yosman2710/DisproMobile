-- PASO 2: Código para la Edge Function de Supabase
-- Debes crear una función llamada 'send-push-notification' en el dashboard de Supabase (Edge Functions)

/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    const { record, type } = payload // 'record' es la transacción insertada

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Obtener el push_token del empleado afectado
    const { data: profile } = await supabase
      .from('perfiles')
      .select('push_token, nombre')
      .eq('id', record.perfil_id)
      .single()

    if (!profile?.push_token) {
      return new Response(JSON.stringify({ message: 'No token found' }), { status: 200 })
    }

    // 2. Preparar el mensaje
    let title = "Movimiento en tu cuenta"
    let body = ""
    
    if (record.tipo === 'deposito') {
      body = `¡Felicidades ${profile.nombre}! Se te han depositado $${record.monto_total}.`
    } else {
      body = `Has realizado un canje por $${record.monto_total}.`
    }

    // 3. Enviar a Expo
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'accept-encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: profile.push_token,
        title: title,
        body: body,
        data: { transactionId: record.id },
        sound: 'default'
      }),
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
*/

-- PASO 3: Crear el Webhook en Supabase mediante SQL
-- Esto reemplaza la configuración manual en el Dashboard.

-- 1. Asegurarse de que la extensión pg_net esté habilitada
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Crear la función que disparará la petición HTTP
CREATE OR REPLACE FUNCTION public.disparar_notificacion_transaccion()
RETURNS TRIGGER AS $$
BEGIN
  -- Reemplaza 'TU_URL_DE_FUNCTION' y 'TU_ANON_KEY' con los valores reales
  PERFORM net.http_post(
    url := 'TU_URL_DE_FUNCTION',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer TU_ANON_KEY'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'record', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el Trigger
DROP TRIGGER IF EXISTS trg_enviar_notificacion ON public.transacciones;
CREATE TRIGGER trg_enviar_notificacion
AFTER INSERT ON public.transacciones
FOR EACH ROW EXECUTE FUNCTION public.disparar_notificacion_transaccion();
