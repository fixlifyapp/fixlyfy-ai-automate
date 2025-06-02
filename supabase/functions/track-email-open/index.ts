
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type'); // estimate, invoice, automation, etc.
    const id = url.searchParams.get('id');
    const trackingId = url.searchParams.get('tracking_id');

    if (!type || !id) {
      // Return a 1x1 transparent pixel
      const pixel = new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
        0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3B
      ]);
      
      return new Response(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user agent and IP for analytics
    const userAgent = req.headers.get('User-Agent') || '';
    const ip = req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || '';

    // Log email open
    await supabaseClient
      .from('email_analytics')
      .insert({
        email_type: type,
        entity_id: id,
        tracking_id: trackingId,
        event_type: 'open',
        user_agent: userAgent,
        ip_address: ip,
        opened_at: new Date().toISOString()
      });

    // Update communication record if exists
    if (type === 'estimate') {
      await supabaseClient
        .from('estimate_communications')
        .update({ 
          opened_at: new Date().toISOString(),
          status: 'opened'
        })
        .eq('estimate_id', id)
        .is('opened_at', null);
    } else if (type === 'invoice') {
      await supabaseClient
        .from('invoice_communications')
        .update({ 
          opened_at: new Date().toISOString(),
          status: 'opened'
        })
        .eq('invoice_id', id)
        .is('opened_at', null);
    }

    // Return 1x1 transparent pixel
    const pixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3B
    ]);
    
    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error tracking email open:', error);
    
    // Always return a pixel even on error
    const pixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3B
    ]);
    
    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif'
      }
    });
  }
});
