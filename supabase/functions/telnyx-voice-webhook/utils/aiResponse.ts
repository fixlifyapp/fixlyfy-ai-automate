
import { BusinessConfig } from './businessConfig.ts'

export const generateAIResponse = async (userMessage: string, businessConfig: BusinessConfig, openaiApiKey: string): Promise<string> => {
  const systemPrompt = `You are ${businessConfig.agent_name} for ${businessConfig.company_name}, a ${businessConfig.business_type} business.

COMPANY INFORMATION:
- Company: ${businessConfig.company_name}
- Business Type: ${businessConfig.business_type}
- Phone: ${businessConfig.company_phone}
${businessConfig.company_address ? `- Address: ${businessConfig.company_address}, ${businessConfig.company_city}, ${businessConfig.company_state}` : ''}
${businessConfig.service_zip_codes ? `- Service Areas: ${businessConfig.service_zip_codes}` : ''}

PRICING:
- Diagnostic service: $${businessConfig.diagnostic_price}
- Emergency surcharge: $${businessConfig.emergency_surcharge} (for after-hours calls)

SERVICES OFFERED:
${businessConfig.service_types?.join(', ') || 'HVAC, Plumbing, Electrical, General Repair'}

IMPORTANT INSTRUCTIONS:
1. Be helpful, professional, and conversational
2. If they need service, offer to schedule an appointment
3. Ask for their name, phone number, and what service they need
4. Keep responses under 100 words for phone conversation
5. If they want to schedule, say you'll help them book the appointment
6. Speak naturally and be empathetic to their needs

${businessConfig.custom_prompt_additions || ''}

Remember: You represent ${businessConfig.company_name} and should always mention the company name when introducing yourself.`

  try {
    console.log('Generating AI response for user message:', userMessage)
    
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    })

    let aiResponse = "I'm sorry, I'm having trouble right now. Please try calling back in a few minutes."
    
    if (gptResponse.ok) {
      const gptData = await gptResponse.json()
      aiResponse = gptData.choices[0]?.message?.content || aiResponse
      console.log('AI Response generated:', aiResponse)
    } else {
      const errorText = await gptResponse.text()
      console.error('GPT API error:', errorText)
    }

    return aiResponse
  } catch (error) {
    console.error('Error generating AI response:', error)
    return "I'm sorry, I'm having trouble right now. Please try calling back in a few minutes."
  }
}

export const checkForSchedulingIntent = (userMessage: string, aiResponse: string): boolean => {
  const scheduleKeywords = ['schedule', 'appointment', 'book', 'when can', 'available', 'come out', 'visit', 'time']
  return scheduleKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes('schedule')
  )
}
