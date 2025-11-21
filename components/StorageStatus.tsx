'use client';

import { useEffect, useState } from 'react';

interface StorageStats {
    localPosts: number;
    backupPosts: number;
    supabasePosts: number;
    storagePath: string;
    backupPath: string;
}

export function StorageStatus() {
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/storage');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch storage stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-purple-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-purple-100 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-purple-100 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="card-gradient text-white p-6 animate-slide-in-up">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>🗄️</span> Distributed Storage Status
            </h2>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur border border-white/20">
                    <div className="text-3xl font-bold mb-1">{stats.supabasePosts}</div>
                    <div className="text-sm text-white/80">☁️ Supabase Cloud</div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur border border-white/20">
                    <div className="text-3xl font-bold mb-1">{stats.localPosts}</div>
                    <div className="text-sm text-white/80">💻 Local Storage</div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur border border-white/20">
                    <div className="text-3xl font-bold mb-1">{stats.backupPosts}</div>
                    <div className="text-sm text-white/80">💾 Backup Copies</div>
                </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur border border-white/20 text-sm space-y-2">
                <div>
                    <strong className="text-white/90">Local Path:</strong>
                    <div className="font-mono text-xs text-white/70 mt-1 break-all">{stats.storagePath}</div>
                </div>
                <div>
                    <strong className="text-white/90">Backup Path:</strong>
                    <div className="font-mono text-xs text-white/70 mt-1 break-all">{stats.backupPath}</div>
                </div>
            </div>

            <div className="mt-4 text-sm text-white/80">
                ℹ️ All posts are automatically synced to cloud storage, saved locally, and backed up
            </div>
        </div>
    );
}
