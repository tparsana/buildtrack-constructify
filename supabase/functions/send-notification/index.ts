
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  type?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, text, html, type } = await req.json() as EmailPayload;
    
    // Log the email information (in a real app, we would send the email here)
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${text}`);
    console.log(`Type: ${type || 'general'}`);
    
    // In a production app, we would integrate with an email service like SendGrid, Resend, etc.
    // For this demo, we'll just simulate successful email sending

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification sent successfully' 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('Error in send-notification function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
