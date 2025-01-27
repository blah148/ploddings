
export default async function handler(req, res) {

    console.log("Incoming Request Method:", req.method);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { ip, page_id } = req.body;
    console.log("Logging visit - IP:", ip, "Page ID:", page_id);

    if (!ip || !page_id) {
        return res.status(400).json({ error: 'IP and Page ID are required' });
    }

    try {
        const visitRecord = {
            ip,
            page_id,
            visited_at: new Date(),
        };

        const { error: upsertError } = await supabase
            .from('visit_history')
            .upsert([visitRecord], {
                returning: 'minimal',
            });

        if (upsertError) {
            console.error('Supabase Upsert Error:', upsertError);
            throw upsertError;
        }

        res.status(200).json({ message: 'Visit logged or updated successfully' });
    } catch (error) {
        console.error('Error logging visit:', error);
        res.status(500).json({ error: 'Failed to log visit' });
    }
}

