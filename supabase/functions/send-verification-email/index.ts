import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, token } = await req.json()

    console.log(`Sending verification email to ${email} with token ${token}`)

    const client = new SmtpClient()

    await client.connectTLS({
      hostname: Deno.env.get('SMTP_HOST')!,
      port: Number(Deno.env.get('SMTP_PORT')),
      username: Deno.env.get('SMTP_USER')!,
      password: Deno.env.get('SMTP_PASSWORD')!,
    })

    const verificationLink = `${req.headers.get('origin')}/verify-email?token=${token}`

    await client.send({
      from: Deno.env.get('SMTP_USER')!,
      to: email,
      subject: "E-Mail-Adresse bestätigen",
      content: `
        <h2>E-Mail-Adresse bestätigen</h2>
        <p>Bitte klicke auf den folgenden Link, um deine E-Mail-Adresse zu bestätigen:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>Dieser Link ist nur für kurze Zeit gültig.</p>
      `,
      html: true,
    })

    await client.close()

    console.log('Verification email sent successfully')

    return new Response(
      JSON.stringify({ message: 'Verification email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-verification-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})