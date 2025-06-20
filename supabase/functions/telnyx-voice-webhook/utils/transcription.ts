
export const transcribeAudio = async (recordingUrl: string, openaiApiKey: string): Promise<string> => {
  try {
    console.log('Transcribing recording from URL:', recordingUrl)
    
    // Download the recording
    const recordingResponse = await fetch(recordingUrl)
    if (!recordingResponse.ok) {
      throw new Error(`Failed to fetch recording: ${recordingResponse.status}`)
    }
    
    const audioBuffer = await recordingResponse.arrayBuffer()
    console.log('Downloaded audio buffer size:', audioBuffer.byteLength)
    
    // Transcribe with OpenAI Whisper
    const formData = new FormData()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })
    formData.append('file', audioBlob, 'recording.wav')
    formData.append('model', 'whisper-1')

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    })

    if (transcriptionResponse.ok) {
      const transcription = await transcriptionResponse.json()
      const transcribedText = transcription.text || ''
      console.log('Transcribed message:', transcribedText)
      return transcribedText
    } else {
      const errorText = await transcriptionResponse.text()
      console.error('Transcription failed:', errorText)
      return ''
    }
  } catch (error) {
    console.error('Error transcribing recording:', error)
    return ''
  }
}
