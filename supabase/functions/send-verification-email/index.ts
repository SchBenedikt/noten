import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, token } = await req.json()

    console.log(`Sending verification email to ${email} with token ${token}`)

    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST")!,
        port: parseInt(Deno.env.get("SMTP_PORT")!),
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USER")!,
          password: Deno.env.get("SMTP_PASSWORD")!,
        },
      },
    });

    const verificationLink = `${req.headers.get('origin')}/verify-email?token=${token}`

    const info = await client.send({
      from: Deno.env.get('SMTP_USER')!,
      to: email,
      subject: "E-Mail-Adresse bestätigen",
      html: `
        <h2>E-Mail-Adresse bestätigen</h2>
        <p>Bitte klicke auf den folgenden Link, um deine E-Mail-Adresse zu bestätigen:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>Dieser Link ist nur für kurze Zeit gültig.</p>
      `,
    });

    await client.close();

    console.log("Email sent successfully:", info);

    return new Response(
      JSON.stringify({ message: 'Verification email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-verification-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});