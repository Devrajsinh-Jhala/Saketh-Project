import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
    try {
        const { content, analysisType } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let prompt = '';

        switch (analysisType) {
            case 'summary':
                prompt = `Analyze this blog post and provide a JSON response with the following:
{
  "wordCount": number,
  "readingTimeMinutes": number,
  "sentiment": "positive" | "neutral" | "negative",
  "readabilityScore": number (0-100, where 100 is easiest to read),
  "keyTopics": ["topic1", "topic2", "topic3"],
  "contentQuality": number (0-100),
  "suggestions": ["suggestion1", "suggestion2"]
}

Blog content:
${content}`;
                break;

            case 'keywords':
                prompt = `Extract the top 10 most important keywords and key phrases from this blog post. Return ONLY a JSON array of strings:
["keyword1", "keyword2", ...]

Blog content:
${content}`;
                break;

            case 'improvement':
                prompt = `Analyze this blog post and provide 5 specific, actionable suggestions to improve it. Consider:
- Clarity and structure
- Engagement and readability
- SEO optimization
- Content depth
- Grammar and style

Return a JSON array of suggestion objects:
[
  {
    "category": "Structure" | "Content" | "Style" | "SEO" | "Engagement",
    "issue": "brief description of the issue",
    "suggestion": "specific action to take",
    "priority": "high" | "medium" | "low"
  }
]

Blog content:
${content}`;
                break;

            default:
                return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
        }

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from markdown code blocks if present
        let jsonText = text.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
        }

        const analysis = JSON.parse(jsonText);

        return NextResponse.json({ analysis });
    } catch (error: any) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: error.message || 'Analysis failed' },
            { status: 500 }
        );
    }
}
