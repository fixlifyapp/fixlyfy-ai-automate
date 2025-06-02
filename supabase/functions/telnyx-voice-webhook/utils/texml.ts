
export const createGreetingTeXML = (greeting: string): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${greeting}</Say>
    <Record 
        action="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
        method="POST"
        maxLength="20"
        finishOnKey="#"
        timeout="10"
        playBeep="false"
    />
</Response>`
}

export const createResponseTeXML = (message: string): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${message}</Say>
    <Record 
        action="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
        method="POST"
        maxLength="20"
        finishOnKey="#"
        timeout="10"
        playBeep="false"
    />
</Response>`
}

export const createClarificationTeXML = (): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I didn't catch that clearly. Could you please tell me what you need help with?</Say>
    <Record 
        action="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
        method="POST"
        maxLength="20"
        finishOnKey="#"
        timeout="10"
        playBeep="false"
    />
</Response>`
}

export const createErrorTeXML = (): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, we're experiencing technical difficulties. Please try calling back later.</Say>
    <Hangup/>
</Response>`
}

export const createAppointmentTeXML = (aiResponse: string): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${aiResponse} What's the best phone number to reach you, and what type of service do you need?</Say>
    <Record 
        action="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
        method="POST"
        maxLength="20"
        finishOnKey="#"
        timeout="10"
        playBeep="false"
    />
</Response>`
}
