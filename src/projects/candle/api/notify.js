// api/notify.js
// Vercel Serverless Function

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL;
    const TO_EMAIL = process.env.TO_EMAIL;
    const DISCORD_LINK = process.env.DISCORD_LINK;
    const SITE_LINK = process.env.SITE_LINK;

    if (!RESEND_API_KEY || !FROM_EMAIL || !TO_EMAIL) {
        return res.status(500).json({ error: 'Server configuration missing.' });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [TO_EMAIL],
                subject: 'I am waiting for you...',
                html: `
                    <div style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #050505; color: #ffffff;">
                        <h2 style="color: #ff8c00;">The candle is lit.</h2>
                        <p style="color: #cccccc;">I am waiting for you on our Discord call.</p>
                        <br/>
                        <a href="${DISCORD_LINK}" style="display: inline-block; padding: 10px 20px; background-color: #5865F2; color: white; text-decoration: none; border-radius: 5px; margin-bottom: 20px;">Join Discord Call</a>
                        <br/>
                        <p style="color: #cccccc;">Watch the candle burn:</p>
                        <a href="${SITE_LINK}" style="color: #ff8c00; text-decoration: none;">${SITE_LINK}</a>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Resend API Error:', error);
            return res.status(response.status).json({ error: 'Failed to send email' });
        }

        const data = await response.json();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Fetch Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
