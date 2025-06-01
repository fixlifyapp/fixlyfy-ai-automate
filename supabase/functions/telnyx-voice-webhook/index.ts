
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface TelnyxWebhookEvent {
  data: {
    event_type: string;
    id: string;
    payload: {
      call_control_id?: string;
      connection_id?: string;
      call_session_id?: string;
      call_leg_id?: string;
      from?: string;
      to?: string;
      direction?: string;
      state?: string;
      client_state?: string;
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Telnyx Voice Webhook: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured')
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const webhookEvent: TelnyxWebhookEvent = await req.json()
    console.log('Telnyx webhook event:', JSON.stringify(webhookEvent, null, 2))

    const { event_type, payload } = webhookEvent.data

    // Обработка входящего звонка
    if (event_type === 'call.initiated' && payload.direction === 'incoming') {
      console.log('Входящий звонок от:', payload.from, 'на номер:', payload.to)

      // Находим пользователя по номеру телефона
      const { data: phoneNumberData } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('user_id')
        .eq('phone_number', payload.to)
        .single()

      const userId = phoneNumberData?.user_id || '00000000-0000-0000-0000-000000000000'

      // Находим активную AI конфигурацию
      const { data: aiConfigs } = await supabaseClient
        .from('ai_agent_configs')
        .select('*')
        .eq('is_active', true)
        .eq('user_id', userId)
        .limit(1)

      let aiConfig = aiConfigs?.[0]
      if (!aiConfig) {
        console.log('Используем стандартную AI конфигурацию')
        aiConfig = {
          business_niche: 'General Service',
          diagnostic_price: 75,
          emergency_surcharge: 50,
          agent_name: 'AI Assistant',
          voice_id: 'alloy',
          greeting_template: 'Привет! Меня зовут {agent_name}. Я AI помощник компании {company_name}. Как дела?',
          company_name: 'наша компания',
          service_areas: [],
          business_hours: {},
          service_types: ['HVAC', 'Plumbing', 'Electrical', 'General Repair']
        }
      }

      // Логируем звонок в новую таблицу
      const { error: logError } = await supabaseClient
        .from('telnyx_calls')
        .insert({
          call_control_id: payload.call_control_id,
          call_session_id: payload.call_session_id,
          phone_number: payload.from,
          to_number: payload.to,
          call_status: 'initiated',
          direction: 'incoming',
          started_at: new Date().toISOString(),
          user_id: userId
        })

      if (logError) {
        console.error('Ошибка логирования звонка:', logError)
      }

      // Отвечаем на звонок
      const answerResponse = await fetch('https://api.telnyx.com/v2/calls/actions/answer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_control_id: payload.call_control_id,
          client_state: JSON.stringify({ ai_config: aiConfig })
        })
      })

      if (!answerResponse.ok) {
        console.error('Ошибка ответа на звонок:', await answerResponse.text())
        throw new Error('Failed to answer call')
      }

      console.log('Звонок принят, ожидаем подключения для старта AI')
    }

    // Когда звонок подключен, запускаем AI
    else if (event_type === 'call.answered') {
      console.log('Звонок подключен, запускаем AI диалог')

      const clientState = payload.client_state ? JSON.parse(payload.client_state) : {}
      const aiConfig = clientState.ai_config || {}

      // Генерируем приветствие
      const currentHour = new Date().getHours()
      const timeOfDay = currentHour < 12 ? 'утро' : currentHour < 17 ? 'день' : 'вечер'
      
      let greeting = aiConfig.greeting_template || 'Привет! Меня зовут {agent_name}. Я AI помощник. Как дела?'
      greeting = greeting
        .replace(/{agent_name}/g, aiConfig.agent_name || 'AI Assistant')
        .replace(/{company_name}/g, aiConfig.company_name || 'наша компания')
        .replace(/{time_of_day}/g, timeOfDay)

      // Говорим приветствие через Telnyx TTS
      const speakResponse = await fetch('https://api.telnyx.com/v2/calls/actions/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_control_id: payload.call_control_id,
          payload: greeting,
          voice: 'female',
          language: 'ru'
        })
      })

      if (!speakResponse.ok) {
        console.error('Ошибка TTS:', await speakResponse.text())
      }

      // Запускаем прослушивание после приветствия
      setTimeout(async () => {
        await fetch('https://api.telnyx.com/v2/calls/actions/gather_using_audio', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            call_control_id: payload.call_control_id,
            audio_url: 'silence_stream://1000',
            minimum_digits: 0,
            maximum_digits: 0,
            timeout_millis: 30000,
            inter_digit_timeout_millis: 5000
          })
        })
      }, 5000)
    }

    // Обработка завершения звонка
    else if (event_type === 'call.hangup') {
      console.log('Звонок завершен')
      
      // Обновляем статус в базе
      await supabaseClient
        .from('telnyx_calls')
        .update({
          call_status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('call_control_id', payload.call_control_id)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })

  } catch (error) {
    console.error('Ошибка обработки Telnyx webhook:', error)
    
    return new Response(JSON.stringify({
      error: 'Webhook processing failed',
      message: error.message
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 500
    })
  }
})
