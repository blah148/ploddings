import sgMail from '@sendgrid/mail';
import { supabase } from '../../utils/supabase';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, pdfUrl, songName } = req.body;

    if (!email || !pdfUrl) {
        return res.status(400).json({ error: 'Missing email or pdfUrl' });
    }

    try {
        // Check if the email exists in the "users" table
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        // If the email does not exist, create a new user
        if (!existingUser) {
            const { data: newUser, error: newUserError } = await supabase
                .from('users')
                .insert([{ email }])
                .single();

            if (newUserError) {
                throw new Error('Failed to create new user');
            }
        }

        // Fetch the PDF from the URL using the globally available fetch
        const pdfResponse = await fetch(pdfUrl);
        if (!pdfResponse.ok) {
            throw new Error(`Failed to fetch PDF from ${pdfUrl}`);
        }
        const pdfBuffer = await pdfResponse.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

        // Send the email with SendGrid
        const msg = {
            to: email, // Email provided directly
            from: 'no-reply@ploddings.com', // Replace with your verified SendGrid email
            subject: `Your PDF tablature for "${songName}"`,
            text: 'Please find the attached PDF document.',
            attachments: [
                {
                    content: pdfBase64,
                    filename: `${songName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment',
                    content_id: 'pdfDocument'
                },
            ],
        };

        await sgMail.send(msg);
        return res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Failed to send PDF email:', error);
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}

