/**
 * Base class for application-specific errors
 */
export class AppError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error thrown during file system operations
 */
export class FileSystemError extends AppError {
    constructor(message: string, originalError?: unknown) {
        super(message, 'FILE_SYSTEM_ERROR', originalError);
    }
}

/**
 * Error thrown during pattern matching operations
 */
export class PatternError extends AppError {
    constructor(
        message: string,
        public readonly pattern: string,
        originalError?: unknown
    ) {
        super(message, 'PATTERN_ERROR', originalError);
    }
}

/**
 * Error thrown when a file read operation fails
 */
export class FileReadError extends FileSystemError {
    constructor(
        public readonly filePath: string,
        message: string,
        originalError?: unknown
    ) {
        super(`Error reading file ${filePath}: ${message}`, originalError);
    }
}

/**
 * Error thrown when a directory operation fails
 */
export class DirectoryError extends FileSystemError {
    constructor(
        public readonly dirPath: string,
        message: string,
        originalError?: unknown
    ) {
        super(`Error in directory ${dirPath}: ${message}`, originalError);
    }
}