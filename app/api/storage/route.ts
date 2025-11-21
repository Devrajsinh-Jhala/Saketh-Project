import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { savePostLocally, deletePostLocally } from '@/lib/localStorage';

/**
 * Distributed Storage API
 * Handles saving posts to:
 * 1. Supabase (cloud)
 * 2. Local file system
 * 3. Backup directory (which can be on another laptop)
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, post } = body;

        if (action === 'save') {
            // 1. Save to Supabase (cloud storage)
            const { data: existing } = await supabase
                .from('posts')
                .select('id')
                .eq('slug', post.slug)
                .maybeSingle();

            let supabaseResult;
            if (existing) {
                supabaseResult = await supabase
                    .from('posts')
                    .update(post)
                    .eq('id', existing.id)
                    .select()
                    .single();
            } else {
                supabaseResult = await supabase
                    .from('posts')
                    .insert(post)
                    .select()
                    .single();
            }

            if (supabaseResult.error) {
                throw new Error(`Supabase error: ${supabaseResult.error.message}`);
            }

            // 2. Save to local file system
            const localResult = await savePostLocally(post);

            return NextResponse.json({
                success: true,
                message: 'Post saved successfully to all storage locations',
                storage: {
                    supabase: { success: true, data: supabaseResult.data },
                    local: localResult,
                },
            });
        }

        if (action === 'delete') {
            const { slug } = body;

            // 1. Delete from Supabase
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('slug', slug);

            if (error) {
                throw new Error(`Supabase error: ${error.message}`);
            }

            // 2. Delete from local storage
            const localResult = await deletePostLocally(slug);

            return NextResponse.json({
                success: true,
                message: 'Post deleted successfully from all storage locations',
                storage: {
                    supabase: { success: true },
                    local: localResult,
                },
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Distributed storage error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save to distributed storage' },
            { status: 500 }
        );
    }
}

/**
 * GET handler to retrieve storage statistics
 */
export async function GET() {
    try {
        const { getStorageStats } = await import('@/lib/localStorage');
        const stats = await getStorageStats();

        // Get Supabase count
        const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            success: true,
            stats: {
                ...stats.stats,
                supabasePosts: count || 0,
            },
        });
    } catch (error: any) {
        console.error('Failed to get storage stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get storage stats' },
            { status: 500 }
        );
    }
}
