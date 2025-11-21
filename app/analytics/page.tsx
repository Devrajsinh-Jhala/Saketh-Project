'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Post {
    id: string;
    title: string;
    slug: string;
    content_md: string;
    published_at: string;
}

interface PostAnalysis {
    slug: string;
    title: string;
    wordCount: number;
    readingTimeMinutes: number;
    sentiment: string;
    readabilityScore: number;
    keyTopics: string[];
    contentQuality: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function Analytics() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [analyses, setAnalyses] = useState<PostAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedPost, setSelectedPost] = useState<string | null>(null);
    const [improvements, setImprovements] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [currentAnalyzing, setCurrentAnalyzing] = useState<string>('');

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (!error && data) {
            setPosts(data);
        }
        setLoading(false);
    };

    const analyzeAllPosts = async (postsToAnalyze: Post[]) => {
        setAnalyzing(true);
        setError(null);
        const results: PostAnalysis[] = [];

        for (let i = 0; i < postsToAnalyze.length; i++) {
            const post = postsToAnalyze[i];
            setCurrentAnalyzing(post.title);

            try {
                const res = await fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: post.content_md,
                        analysisType: 'summary'
                    })
                });

                if (res.ok) {
                    const { analysis } = await res.json();
                    results.push({
                        slug: post.slug,
                        title: post.title,
                        ...analysis
                    });
                    setAnalyses([...results]);
                } else {
                    setError(`Rate limit reached. Analyzed ${results.length} posts. Wait 60 seconds and try again.`);
                    break;
                }

                if (i < postsToAnalyze.length - 1) {
                    await delay(5000); // 5 second delay between requests
                }
            } catch (error) {
                console.error(`Failed to analyze ${post.title}:`, error);
                setError('Analysis failed. Please try again later.');
                break;
            }
        }

        setAnalyzing(false);
        setCurrentAnalyzing('');
    };

    const analyzeForImprovements = async (post: Post) => {
        setSelectedPost(post.slug);
        setImprovements([]);
        setError(null);

        try {
            const res = await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: post.content_md,
                    analysisType: 'improvement'
                })
            });

            if (res.ok) {
                const { analysis } = await res.json();
                setImprovements(analysis);
            } else {
                setError('Rate limit reached. Please wait 60 seconds.');
            }
        } catch (error) {
            console.error('Failed to get improvements:', error);
            setError('Failed to get improvements. Please try again later.');
        }
    };

    const avgQuality = analyses.length > 0
        ? Math.round(analyses.reduce((sum, a) => sum + a.contentQuality, 0) / analyses.length)
        : 0;

    const avgReadability = analyses.length > 0
        ? Math.round(analyses.reduce((sum, a) => sum + a.readabilityScore, 0) / analyses.length)
        : 0;

    const totalWords = analyses.reduce((sum, a) => sum + a.wordCount, 0);

    const allTopics = analyses.flatMap(a => a.keyTopics);
    const topicCounts = allTopics.reduce((acc: Record<string, number>, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
    }, {});
    const trendingTopics = Object.entries(topicCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([topic]) => topic);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
                    <p className="text-slate-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold gradient-text mb-2">Content Analytics</h1>
                    <p className="text-slate-600">AI-powered insights for your blog content</p>

                    {/* Analyze Button */}
                    {posts.length > 0 && analyses.length === 0 && !analyzing && (
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => analyzeAllPosts(posts)}
                                className="btn-primary"
                            >
                                📊 Analyze All Posts (AI)
                            </button>
                            <span className="text-sm text-slate-600 flex items-center">
                                ⚡ Uses Gemini AI • 5s delay between posts
                            </span>
                        </div>
                    )}

                    {/* Analyzing Status */}
                    {analyzing && (
                        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                                <div>
                                    <p className="font-medium text-purple-900">Analyzing with AI...</p>
                                    <p className="text-sm text-purple-700">{currentAnalyzing}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6 animate-slide-in-up">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{posts.length}</p>
                                <p className="text-sm text-slate-600">Total Posts</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{avgQuality}%</p>
                                <p className="text-sm text-slate-600">Avg Quality</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{avgReadability}%</p>
                                <p className="text-sm text-slate-600">Readability</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{totalWords.toLocaleString()}</p>
                                <p className="text-sm text-slate-600">Total Words</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trending Topics */}
                {trendingTopics.length > 0 && (
                    <div className="card p-6 mb-8 animate-fade-in">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Trending Topics
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics.map((topic, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Post Analysis Table */}
                {analyses.length > 0 && (
                    <div className="card p-6 mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Post Analysis
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Post</th>
                                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Words</th>
                                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Read Time</th>
                                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Quality</th>
                                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Sentiment</th>
                                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analyses.map((analysis, i) => {
                                        const post = posts.find(p => p.slug === analysis.slug);
                                        return (
                                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <Link href={`/p/${analysis.slug}`} className="font-medium text-purple-600 hover:underline">
                                                        {analysis.title}
                                                    </Link>
                                                </td>
                                                <td className="text-center py-4 px-4 text-slate-600">{analysis.wordCount}</td>
                                                <td className="text-center py-4 px-4 text-slate-600">{analysis.readingTimeMinutes} min</td>
                                                <td className="text-center py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${analysis.contentQuality >= 80 ? 'bg-green-100 text-green-700' :
                                                            analysis.contentQuality >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {analysis.contentQuality}%
                                                    </span>
                                                </td>
                                                <td className="text-center py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${analysis.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                                            analysis.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {analysis.sentiment}
                                                    </span>
                                                </td>
                                                <td className="text-center py-4 px-4">
                                                    {post && (
                                                        <button
                                                            onClick={() => analyzeForImprovements(post)}
                                                            className="btn-outline text-sm px-3 py-1"
                                                            disabled={selectedPost === post.slug && improvements.length === 0}
                                                        >
                                                            {selectedPost === post.slug && improvements.length === 0 ? 'Loading...' : 'Improve'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Improvement Suggestions */}
                {improvements.length > 0 && (
                    <div className="card p-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            AI Improvement Suggestions
                        </h2>
                        <div className="space-y-4">
                            {improvements.map((suggestion, i) => (
                                <div
                                    key={i}
                                    className={`p-4 rounded-lg border-l-4 ${suggestion.priority === 'high' ? 'border-red-500 bg-red-50' :
                                            suggestion.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                                'border-blue-500 bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="font-semibold text-slate-900">{suggestion.category}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${suggestion.priority === 'high' ? 'bg-red-200 text-red-800' :
                                                suggestion.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                    'bg-blue-200 text-blue-800'
                                            }`}>
                                            {suggestion.priority} priority
                                        </span>
                                    </div>
                                    <p className="text-slate-700 mb-2"><strong>Issue:</strong> {suggestion.issue}</p>
                                    <p className="text-slate-700"><strong>Suggestion:</strong> {suggestion.suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
