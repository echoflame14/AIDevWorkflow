import * as fs from 'fs';
import * as path from 'path';
import { DirectoryNode, FileNode, ScannerOptions } from '../types/directory';
import { DirectoryError } from '../errors/customErrors';
import { PathUtils } from './pathUtils';
import { FileReader } from './fileReader';
import { createIgnorePatterns, createIncludeExtensions, shouldIgnorePath, shouldIncludeFile } from '../patterns/ignorePatterns';
import { PatternMatcher } from '../patterns/patternMatcher';

export class DirectoryScanner {
    private readonly ignorePatterns: Set<string>;
    private readonly includeExtensions: Set<string>;
    private readonly rootDir: string;

    constructor(private readonly options: ScannerOptions = {}) {
        this.ignorePatterns = createIgnorePatterns(options);
        this.includeExtensions = createIncludeExtensions(options);
        this.rootDir = options.rootDir || process.cwd();
    }

    /**
     * Determines if a file should be processed based on patterns and extensions
     */
    private shouldProcessFile(filepath: string): boolean {
        // Check against ignore patterns
        if (shouldIgnorePath(filepath, this.ignorePatterns)) {
            return false;
        }

        // Check file extension
        if (!shouldIncludeFile(filepath, this.includeExtensions)) {
            return false;
        }

        // Check against include patterns if specified
        if (this.options.includePatterns && this.options.includePatterns.length > 0) {
            const relativePath = PathUtils.getRelativePath(filepath, this.rootDir);
            return PatternMatcher.matchAnyPattern(relativePath, this.options.includePatterns);
        }

        return true;
    }

    /**
     * Creates a FileNode from a file path
     */
    private createFileNode(filepath: string): FileNode | null {
        try {
            const relativePath = PathUtils.getRelativePath(filepath, this.rootDir);
            
            // Read file with token counting if enabled
            const { content, tokenCount, error } = FileReader.readFile(filepath, {
                calculateTokens: this.options.calculateTokens
            });

            if (error) {
                console.warn(`Warning: ${error.message}`);
                return null;
            }

            return {
                type: 'file',
                name: path.basename(filepath),
                path: relativePath,
                fullPath: filepath,
                content,
                tokenCount,
                extension: PathUtils.getExtension(filepath)
            };
        } catch (error) {
            console.warn(`Warning: Could not process file ${filepath}:`, error);
            return null;
        }
    }

    /**
     * Recursively scans a directory
     */
    private scanDirectory(dirPath: string): DirectoryNode {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            const children: (FileNode | DirectoryNode)[] = [];

            // Process all entries
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                // Skip if path should be ignored
                if (shouldIgnorePath(fullPath, this.ignorePatterns)) {
                    continue;
                }

                if (entry.isDirectory()) {
                    // Recursively scan subdirectories
                    const subDir = this.scanDirectory(fullPath);
                    if (subDir.children.length > 0) {
                        children.push(subDir);
                    }
                } else if (entry.isFile() && this.shouldProcessFile(fullPath)) {
                    // Process files
                    const fileNode = this.createFileNode(fullPath);
                    if (fileNode) {
                        children.push(fileNode);
                    }
                }
            }

            // Create directory node
            return {
                type: 'directory',
                name: path.basename(dirPath),
                path: PathUtils.getRelativePath(dirPath, this.rootDir),
                fullPath: dirPath,
                children: children.sort((a, b) => a.name.localeCompare(b.name))
            };
        } catch (error) {
            throw new DirectoryError(dirPath, 'Error scanning directory', error);
        }
    }

    /**
     * Scans the directory tree starting from rootDir
     */
    public scan(): DirectoryNode {
        return this.scanDirectory(this.rootDir);
    }
}