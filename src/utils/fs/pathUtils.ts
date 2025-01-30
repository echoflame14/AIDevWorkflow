import * as path from 'path';
import { FileSystemError } from '../errors/customErrors';

export class PathUtils {
    /**
     * Normalizes a path to use forward slashes and removes trailing slashes
     */
    static normalize(filepath: string): string {
        return filepath.replace(/[\\/]+/g, '/').replace(/\/$/, '');
    }

    /**
     * Gets relative path from root directory
     */
    static getRelativePath(filepath: string, rootDir: string): string {
        const relativePath = path.relative(rootDir, filepath);
        return this.normalize(relativePath);
    }

    /**
     * Gets absolute path
     */
    static getAbsolutePath(filepath: string, rootDir: string): string {
        if (path.isAbsolute(filepath)) {
            return this.normalize(filepath);
        }
        return this.normalize(path.resolve(rootDir, filepath));
    }

    /**
     * Validates a path exists and is accessible
     */
    static validatePath(filepath: string): boolean {
        try {
            return require('fs').existsSync(filepath);
        } catch (error) {
            throw new FileSystemError(`Invalid path: ${filepath}`, error);
        }
    }

    /**
     * Gets file extension (including the dot)
     */
    static getExtension(filepath: string): string {
        const ext = path.extname(filepath);
        return ext.toLowerCase();
    }

    /**
     * Gets the base name of a path without extension
     */
    static getBaseName(filepath: string): string {
        return path.basename(filepath, path.extname(filepath));
    }

    /**
     * Joins path segments with proper normalization
     */
    static join(...paths: string[]): string {
        return this.normalize(path.join(...paths));
    }

    /**
     * Creates a path suitable for display (truncated if too long)
     */
    static createDisplayPath(filepath: string, maxLength: number = 50): string {
        if (filepath.length <= maxLength) {
            return filepath;
        }
        const start = filepath.slice(0, Math.floor(maxLength / 2) - 2);
        const end = filepath.slice(-Math.floor(maxLength / 2) + 1);
        return `${start}...${end}`;
    }
}