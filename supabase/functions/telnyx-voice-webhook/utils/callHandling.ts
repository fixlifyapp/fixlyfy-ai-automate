
export const findOrCreatePhoneNumber = async (supabaseClient: any, phoneNumber: string) => {
  const { data: existingNumber } = await supabaseClient
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single()

  if (existingNumber) {
    console.log('Found existing phone number data')
    return existingNumber
  }

  console.log('Phone number not found, creating entry for:', phoneNumber)
  const { data: newNumber, error: createError } = await supabaseClient
    .from('telnyx_phone_numbers')
    .insert({
      phone_number: phoneNumber,
      status: 'active',
      country_code: 'US',
      configured_at: new Date().toISOString(),
      webhook_url: 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook'
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating phone number entry:', createError)
    return null
  }

  console.log('Created new phone number entry')
  return newNumber
}

export const logCallToDatabase = async (supabaseClient: any, callSid: string, from: string, to: string, phoneNumberData: any) => {
  const { data: newCallRecord, error: logError } = await supabaseClient
    .from('telnyx_calls')
    .insert({
      call_control_id: callSid,
      call_session_id: callSid,
      phone_number: from,
      to_number: to,
      call_status: 'initiated',
      direction: 'incoming',
      started_at: new Date().toISOString(),
      user_id: phoneNumberData?.user_id || null,
      appointment_scheduled: false,
      appointment_data: null
    })
    .select()
    .single()

  if (logError && logError.code !== '23505') { // Ignore duplicate key errors
    console.error('Error logging call to database:', logError)
  } else {
    console.log('Call logged to database successfully')
  }

  return newCallRecord
}

export const updateCallStatus = async (supabaseClient: any, callSid: string, status: string, additionalData: any = {}) => {
  await supabaseClient
    .from('telnyx_calls')
    .update({
      call_status: status,
      ...additionalData,
      ...(status === 'completed' ? { ended_at: new Date().toISOString() } : {})
    })
    .eq('call_control_id', callSid)
}
