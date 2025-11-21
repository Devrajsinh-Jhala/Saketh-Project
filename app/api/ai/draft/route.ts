import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    let body: any = {};
    try { body = await req.json(); } catch { }
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = [
      'Write a concise, well-structured blog post draft in Markdown.',
      `Title: "${title}"`,
      'Use ## and ### headings, short paragraphs, and examples.',
      'Do NOT include any metadata, JSON, or code-fenced JSON. Output Markdown ONLY.'
    ].join('\n');

    const result = await model.generateContent(prompt);
    const draft = result?.response?.text?.() ?? '';
    if (!draft) return NextResponse.json({ error: 'Empty response from model' }, { status: 502 });

    return NextResponse.json({ draft });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
