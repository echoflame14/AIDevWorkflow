import { IgnoreOptions } from '../patterns/ignorePatterns';

/**
 * Base interface for both file and directory nodes
 */
export interface BaseNode {
    /** Name of the file or directory */
    name: string;
    /** Relative path from the root directory */
    path: string;
    /** Absolute path (used internally) */
    fullPath: string;
}

/**
 * Represents a file in the directory structure
 */
export interface FileNode extends BaseNode {
    type: 'file';
    /** Optional file content */
    content?: string;
    /** Estimated token count for the file */
    tokenCount?: number;
    /** File extension */
    extension?: string;
}

/**
 * Represents a directory in the directory structure
 */
export interface DirectoryNode extends BaseNode {
    type: 'directory';
    /** Child nodes (files and directories) */
    children: (FileNode | DirectoryNode)[];
}

/**
 * Pattern for file inclusion/exclusion
 */
export interface FilePattern {
    /** The pattern string (glob or regex) */
    pattern: string;
    /** Whether the pattern is a regular expression */
    isRegex: boolean;
}

/**
 * Options for directory scanning
 */
export interface ScannerOptions extends IgnoreOptions {
    /** Patterns for including files */
    includePatterns?: FilePattern[];
    /** Whether to calculate token counts */
    calculateTokens?: boolean;
    /** Root directory for relative path calculation */
    rootDir?: string;
    /** Whether to store file content in nodes */
    storeFileContent?: boolean;
}

/**
 * Result of a file read operation
 */
export interface FileReadResult {
    /** The content of the file */
    content: string;
    /** Any error that occurred during reading */
    error?: Error;
    /** The number of tokens in the file */
    tokenCount?: number;
}