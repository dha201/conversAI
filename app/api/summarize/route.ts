// File: /app/api/summarize/route.ts

import { OpenAI } from 'openai';

export async function POST(req: Request) {
    try {
        const { context } = await req.json();
        if (typeof context !== 'string') {
            throw new Error('Invalid context format');
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that summarizes large texts.',
                },
                {
                    role: 'user',
                    content: `Please summarize the following context:\n\n${context}`,
                },
            ],
            temperature: 0.7,
        });
        console.log('OpenAI response:', response);

        const summary = response.choices[0].message?.content?.trim() || '';
        console.log('Generated summary:', summary);

        console.log('Sending response:', { summary });

        return new Response(JSON.stringify({ summary }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
}
