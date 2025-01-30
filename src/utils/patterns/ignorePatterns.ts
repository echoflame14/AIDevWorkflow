/**
 * Default patterns for files and directories to ignore
 */
export const DEFAULT_IGNORE_PATTERNS = new Set([
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.git',
    '.cache',
    '.next',
    '__pycache__',
    '.DS_Store',
    'package-lock.json'
]);

/**
 * Default file extensions to include
 */
export const DEFAULT_INCLUDE_EXTENSIONS = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.json',
    '.md',
    '.txt'
]);

/**
 * Options for configuring ignore patterns
 */
export interface IgnoreOptions {
    /** Additional patterns to ignore */
    additionalIgnorePatterns?: Set<string>;
    /** Whether to extend or replace default patterns */
    extendDefaults?: boolean;
    /** Additional file extensions to include */
    additionalExtensions?: Set<string>;
    /** Whether to extend or replace default extensions */
    extendExtensions?: boolean;
}

/**
 * Creates a configured set of ignore patterns
 */
export const createIgnorePatterns = (options: IgnoreOptions = {}): Set<string> => {
    const {
        additionalIgnorePatterns = new Set(),
        extendDefaults = true
    } = options;

    if (!extendDefaults) {
        return new Set(additionalIgnorePatterns);
    }

    return new Set([
        ...DEFAULT_IGNORE_PATTERNS,
        ...additionalIgnorePatterns
    ]);
};

/**
 * Creates a configured set of include extensions
 */
export const createIncludeExtensions = (options: IgnoreOptions = {}): Set<string> => {
    const {
        additionalExtensions = new Set(),
        extendExtensions = true
    } = options;

    if (!extendExtensions) {
        return new Set(additionalExtensions);
    }

    return new Set([
        ...DEFAULT_INCLUDE_EXTENSIONS,
        ...additionalExtensions
    ]);
};

/**
 * Checks if a path should be ignored based on configured patterns
 */
export const shouldIgnorePath = (
    path: string,
    ignorePatterns: Set<string>
): boolean => {
    const pathParts = path.split(/[\\/]/);
    return pathParts.some(part => ignorePatterns.has(part));
};

/**
 * Checks if a file should be included based on its extension
 */
export const shouldIncludeFile = (
    path: string,
    includeExtensions: Set<string>
): boolean => {
    const ext = path.slice(path.lastIndexOf('.'));
    return includeExtensions.has(ext);
};