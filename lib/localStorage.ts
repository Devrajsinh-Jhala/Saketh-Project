import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * Local Storage Service for distributed blog posts
 * Stores posts locally as JSON files and manages backups
 */

// Get the local storage directory
const getStorageDir = () => {
    return path.join(os.homedir(), '.ai-blog', 'posts');
};

// Get list of potential cloud backup directories
const getCloudBackupPaths = () => {
    const home = os.homedir();
    return [
        'G:\\My Drive\\BlogBackups',           // Google Drive Desktop (Stream)
        'G:\\BlogBackups',                     // Google Drive Root
        path.join(home, 'Google Drive', 'BlogBackups'), // Google Drive (Mirror)
        path.join(home, 'OneDrive', 'BlogBackups'),     // OneDrive
        '\\\\ASHOK\\BlogBackups'               // Network Share (Fixed spelling)
    ];
};

// Get the local fallback directory
const getLocalBackupDir = () => path.join(os.homedir(), '.ai-blog', 'backups');

/**
 * Ensure directory exists, create if it doesn't
 */
async function ensureDir(dirPath: string) {
    try {
        await fs.access(dirPath);
        return true;
    } catch {
        try {
            await fs.mkdir(dirPath, { recursive: true });
            return true;
        } catch (error) {
            // console.warn(`⚠️ Could not create directory ${dirPath}.`, error);
            return false;
        }
    }
}

/**
 * Save a post to local storage
 */
export async function savePostLocally(post: {
    slug: string;
    title: string;
    content_md: string;
    status: string;
    published_at: string | null;
    author_id: string;
}) {
    try {
        const storageDir = getStorageDir();
        await ensureDir(storageDir);

        const filePath = path.join(storageDir, `${post.slug}.json`);
        const data = {
            ...post,
            last_saved_locally: new Date().toISOString(),
        };

        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ Post saved locally: ${filePath}`);

        // Try backup to Cloud/Network
        await backupPost(post.slug, data);

        return { success: true, path: filePath };
    } catch (error: any) {
        console.error('❌ Failed to save post locally:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Backup a post to the backup directory (Redundant Backup to ALL locations)
 */
async function backupPost(slug: string, data: any) {
    const cloudPaths = getCloudBackupPaths();
    let primaryBackupPath = '';
    let successCount = 0;

    // 1. Try ALL Cloud/Network Paths
    for (const cloudPath of cloudPaths) {
        if (await ensureDir(cloudPath)) {
            try {
                const backupPath = path.join(cloudPath, `${slug}.json`);
                await fs.writeFile(backupPath, JSON.stringify(data, null, 2), 'utf-8');
                console.log(`☁️ Post backed up to: ${backupPath}`);

                if (!primaryBackupPath) primaryBackupPath = backupPath;
                successCount++;
            } catch (err) {
                continue;
            }
        }
    }

    if (successCount > 0) {
        return { success: true, path: primaryBackupPath, type: 'cloud_redundant' };
    }

    // 2. Fallback to Local Backup (only if ALL cloud paths failed)
    try {
        const localBackupDir = getLocalBackupDir();
        await ensureDir(localBackupDir);
        const backupPath = path.join(localBackupDir, `${slug}.json`);
        await fs.writeFile(backupPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`💾 Post backed up to LOCAL FALLBACK: ${backupPath}`);
        return { success: true, path: backupPath, type: 'local_fallback' };
    } catch (error: any) {
        console.error('❌ All backups failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Load a post from local storage
 */
export async function loadPostLocally(slug: string) {
    try {
        const storageDir = getStorageDir();
        const filePath = path.join(storageDir, `${slug}.json`);

        const data = await fs.readFile(filePath, 'utf-8');
        return { success: true, post: JSON.parse(data) };
    } catch (error: any) {
        console.error('❌ Failed to load post locally:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all local posts
 */
export async function getAllLocalPosts() {
    try {
        const storageDir = getStorageDir();
        await ensureDir(storageDir);

        const files = await fs.readdir(storageDir);
        const posts = await Promise.all(
            files
                .filter(file => file.endsWith('.json'))
                .map(async file => {
                    const data = await fs.readFile(path.join(storageDir, file), 'utf-8');
                    return JSON.parse(data);
                })
        );

        return { success: true, posts };
    } catch (error: any) {
        console.error('❌ Failed to get local posts:', error);
        return { success: false, error: error.message, posts: [] };
    }
}

/**
 * Delete a post from local storage and backup
 */
export async function deletePostLocally(slug: string) {
    try {
        const storageDir = getStorageDir();
        const cloudPaths = getCloudBackupPaths();
        const localBackupDir = getLocalBackupDir();

        const filePath = path.join(storageDir, `${slug}.json`);

        // Delete from local storage
        try {
            await fs.unlink(filePath);
            console.log(`🗑️ Post deleted locally: ${filePath}`);
        } catch (error) {
            console.warn('File not found in local storage');
        }

        // Try delete from Cloud Paths
        for (const cloudPath of cloudPaths) {
            try {
                const cloudFilePath = path.join(cloudPath, `${slug}.json`);
                await fs.unlink(cloudFilePath);
                console.log(`🗑️ Post deleted from cloud: ${cloudFilePath}`);
            } catch (error) {
                // Ignore
            }
        }

        // Try delete from Local Fallback Backup
        try {
            const localPath = path.join(localBackupDir, `${slug}.json`);
            await fs.unlink(localPath);
            console.log(`🗑️ Post deleted from local fallback backup: ${localPath}`);
        } catch (error) {
            // Ignore
        }

        return { success: true };
    } catch (error: any) {
        console.error('❌ Failed to delete post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync posts from another laptop (reads from a configured network path)
 */
export async function syncFromRemote(remotePath?: string) {
    try {
        // If no remote path is provided, skip syncing
        if (!remotePath) {
            console.log('ℹ️ No remote path configured, skipping sync');
            return { success: true, synced: 0 };
        }

        const storageDir = getStorageDir();
        await ensureDir(storageDir);

        // Read files from remote path
        const remoteFiles = await fs.readdir(remotePath);
        let syncedCount = 0;

        for (const file of remoteFiles) {
            if (!file.endsWith('.json')) continue;

            const remoteFilePath = path.join(remotePath, file);
            const localFilePath = path.join(storageDir, file);

            // Read remote file
            const remoteData = await fs.readFile(remoteFilePath, 'utf-8');
            const remotePost = JSON.parse(remoteData);

            // Check if local version exists
            try {
                const localData = await fs.readFile(localFilePath, 'utf-8');
                const localPost = JSON.parse(localData);

                // Compare timestamps and sync newer version
                if (new Date(remotePost.last_saved_locally) > new Date(localPost.last_saved_locally)) {
                    await fs.writeFile(localFilePath, remoteData, 'utf-8');
                    syncedCount++;
                    console.log(`🔄 Synced newer version: ${file}`);
                }
            } catch {
                // Local file doesn't exist, copy it
                await fs.writeFile(localFilePath, remoteData, 'utf-8');
                syncedCount++;
                console.log(`📥 Downloaded new post: ${file}`);
            }
        }

        console.log(`✅ Sync complete. ${syncedCount} posts synced.`);
        return { success: true, synced: syncedCount };
    } catch (error: any) {
        console.error('❌ Failed to sync from remote:', error);
        return { success: false, error: error.message, synced: 0 };
    }
}

/**
 * Get storage statistics
 */
export async function getStorageStats() {
    try {
        const storageDir = getStorageDir();
        const cloudPaths = getCloudBackupPaths();
        const localBackupDir = getLocalBackupDir();

        await ensureDir(storageDir);

        let backupFiles: string[] = [];
        let activeBackupPath = 'None';

        // Try reading from Cloud Paths first
        for (const cloudPath of cloudPaths) {
            try {
                if (await ensureDir(cloudPath)) {
                    backupFiles = await fs.readdir(cloudPath);
                    activeBackupPath = cloudPath;
                    break; // Found working cloud path
                }
            } catch (e) {
                continue;
            }
        }

        // If no cloud path worked, try local fallback
        if (activeBackupPath === 'None') {
            try {
                await ensureDir(localBackupDir);
                backupFiles = await fs.readdir(localBackupDir);
                activeBackupPath = localBackupDir;
            } catch (err) {
                console.warn('Could not access any backup directory');
            }
        }

        const localFiles = await fs.readdir(storageDir);

        return {
            success: true,
            stats: {
                localPosts: localFiles.filter(f => f.endsWith('.json')).length,
                backupPosts: backupFiles.filter(f => f.endsWith('.json')).length,
                storagePath: storageDir,
                backupPath: activeBackupPath,
            }
        };
    } catch (error: any) {
        console.error('❌ Failed to get storage stats:', error);
        return { success: false, error: error.message };
    }
}
