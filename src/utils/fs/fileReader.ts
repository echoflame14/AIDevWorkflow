import * as fs from 'fs';
import { FileReadError } from '../errors/customErrors';
import { FileReadResult } from '../types/directory';
import { PathUtils } from './pathUtils';

export class FileReader {
    /**
     * Default options for file reading
     */
    private static readonly DEFAULT_OPTIONS = {
        encoding: 'utf8' as BufferEncoding,
        calculateTokens: true,
        maxSize: 10 * 1024 * 1024, // 10MB
    };

    /**
     * Estimates token count from content
     * Uses a simple heuristic of ~4 characters per token
     */
    private static calculateTokens(content: string): number {
        return Math.ceil(content.length / 4);
    }

    /**
     * Checks if a file is too large to process
     */
    private static checkFileSize(filepath: string, maxSize: number): void {
        try {
            const stats = fs.statSync(filepath);
            if (stats.size > maxSize) {
                throw new FileReadError(
                    filepath,
                    `File size ${stats.size} bytes exceeds maximum size ${maxSize} bytes`
                );
            }
        } catch (error) {
            if (error instanceof FileReadError) {
                throw error;
            }
            throw new FileReadError(filepath, 'Error checking file size', error);
        }
    }

    /**
     * Reads a file with error handling and optional token counting
     */
    static readFile(
        filepath: string,
        options: {
            encoding?: BufferEncoding;
            calculateTokens?: boolean;
            maxSize?: number;
        } = {}
    ): FileReadResult {
        const {
            encoding,
            calculateTokens,
            maxSize
        } = { ...this.DEFAULT_OPTIONS, ...options };

        try {
            // Validate path
            if (!PathUtils.validatePath(filepath)) {
                throw new FileReadError(filepath, 'File does not exist');
            }

            // Check file size
            this.checkFileSize(filepath, maxSize);

            // Read file
            const content = fs.readFileSync(filepath, { encoding });
            
            // Calculate tokens if requested
            const tokenCount = calculateTokens ? this.calculateTokens(content) : undefined;

            return { content, tokenCount };
        } catch (error) {
            if (error instanceof FileReadError) {
                return { content: '', error };
            }
            const wrappedError = new FileReadError(filepath, 'Error reading file', error);
            return { content: '', error: wrappedError };
        }
    }

    /**
     * Reads a file synchronously and throws on error
     */
    static readFileSync(
        filepath: string,
        options: {
            encoding?: BufferEncoding;
            calculateTokens?: boolean;
            maxSize?: number;
        } = {}
    ): string {
        const result = this.readFile(filepath, options);
        if (result.error) {
            throw result.error;
        }
        return result.content;
    }

    /**
     * Checks if a file exists and is readable
     */
    static isReadable(filepath: string): boolean {
        try {
            fs.accessSync(filepath, fs.constants.R_OK);
            return true;
        } catch {
            return false;
        }
    }
}