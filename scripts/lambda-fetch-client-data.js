
// AWS Lambda function to integrate with Supabase and provide client data to Amazon Connect AI Agent
// This function should be deployed to AWS Lambda and configured as the data source for Connect AI Agent

const { createClient } = require('@supabase/supabase-js');

// Lambda handler function
exports.handler = async (event, context) => {
  console.log('Lambda event:', JSON.stringify(event, null, 2));
  
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract phone number from Connect event
    const phoneNumber = event.Details?.ContactData?.CustomerEndpoint?.Address;
    const instanceId = event.Details?.ContactData?.InstanceARN;
    
    if (!phoneNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Phone number not found in request'
        })
      };
    }
    
    // Format phone number
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+1${phoneNumber.replace(/\D/g, '')}`;
    
    console.log('Looking up client for phone:', formattedPhone);
    
    // Get AI Agent configuration for this Connect instance
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_agent_configs')
      .select('*')
      .eq('connect_instance_arn', instanceId)
      .eq('is_active', true)
      .single();
    
    if (configError) {
      console.error('AI Config error:', configError);
      // Return default configuration if no specific config found
      return {
        statusCode: 200,
        body: JSON.stringify({
          business_niche: 'General Service',
          diagnostic_price: 75.00,
          emergency_surcharge: 50.00,
          custom_prompts: '',
          client_data: null
        })
      };
    }
    
    // Look up existing client by phone number
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        client_properties (*)
      `)
      .eq('phone', formattedPhone)
      .single();
    
    if (clientError && clientError.code !== 'PGRST116') {
      console.error('Client lookup error:', clientError);
    }
    
    // Get recent job history for this client
    let recentJobs = [];
    if (clientData) {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, service, date, status, notes')
        .eq('client_id', clientData.id)
        .order('date', { ascending: false })
        .limit(5);
      
      recentJobs = jobs || [];
    }
    
    // Prepare AI prompt customization based on business niche
    let customPrompts = '';
    
    switch (aiConfig.business_niche) {
      case 'HVAC':
        customPrompts = `You are an AI assistant for an HVAC company. Focus on heating, cooling, and air quality issues. Ask about:
        - Type of HVAC system (central air, heat pump, etc.)
        - Age of the system
        - Specific symptoms (no heat/cooling, strange noises, high bills)
        - Emergency situations (no heat in winter, no AC in extreme heat)`;
        break;
        
      case 'Plumbing':
        customPrompts = `You are an AI assistant for a plumbing company. Focus on water and drainage issues. Ask about:
        - Type of problem (leaks, clogs, no water, etc.)
        - Location of the issue (kitchen, bathroom, basement)
        - Severity and urgency (flooding, major leaks)
        - Water shut-off status if emergency`;
        break;
        
      case 'Electrical':
        customPrompts = `You are an AI assistant for an electrical company. Focus on electrical safety and issues. Ask about:
        - Type of electrical problem (outages, sparks, flickering lights)
        - Safety concerns (burning smells, exposed wires)
        - Circuit breaker status
        - Emergency situations that need immediate attention`;
        break;
        
      case 'Appliance Repair':
        customPrompts = `You are an AI assistant for an appliance repair company. Ask about:
        - Type of appliance (refrigerator, washer, dryer, dishwasher, etc.)
        - Brand and model if known
        - Specific symptoms and error codes
        - Age of the appliance and warranty status`;
        break;
        
      default:
        customPrompts = `You are an AI assistant for a general service company. Be helpful and professional in scheduling appointments for various home services.`;
    }
    
    // Add custom prompt additions from the configuration
    if (aiConfig.custom_prompt_additions) {
      customPrompts += `\n\nAdditional Instructions: ${aiConfig.custom_prompt_additions}`;
    }
    
    // Build response for AI Agent
    const response = {
      business_niche: aiConfig.business_niche,
      diagnostic_price: aiConfig.diagnostic_price,
      emergency_surcharge: aiConfig.emergency_surcharge,
      custom_prompts: customPrompts,
      client_data: clientData ? {
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
        type: clientData.type,
        properties: clientData.client_properties || [],
        recent_jobs: recentJobs,
        is_existing_client: true
      } : {
        is_existing_client: false,
        phone: formattedPhone
      }
    };
    
    console.log('Returning response:', JSON.stringify(response, null, 2));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('Lambda function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};
