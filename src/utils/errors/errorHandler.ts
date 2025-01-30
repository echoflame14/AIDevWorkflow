import { AppError, FileSystemError, PatternError } from './customErrors';

/**
 * Options for error handling
 */
interface ErrorHandlerOptions {
    /** Whether to log debug information */
    debug?: boolean;
    /** Whether to throw the error after handling */
    throwAfterHandle?: boolean;
}

/**
 * Handles application errors with consistent logging and optional throwing
 */
export const handleError = (
    error: unknown,
    context: string,
    options: ErrorHandlerOptions = {}
): void => {
    const { debug = false, throwAfterHandle = false } = options;

    if (error instanceof AppError) {
        console.error(`[${error.code}] ${context}: ${error.message}`);
        if (debug && error.originalError) {
            console.debug('Original error:', error.originalError);
        }
    } else if (error instanceof Error) {
        console.error(`Unexpected error in ${context}:`, error.message);
        if (debug) {
            console.debug('Stack trace:', error.stack);
        }
    } else {
        console.error(`Unknown error in ${context}:`, error);
    }

    if (throwAfterHandle) {
        throw error;
    }
};

/**
 * Specific handler for file system errors
 */
export const handleFileSystemError = (
    error: unknown,
    context: string,
    options: ErrorHandlerOptions = {}
): void => {
    if (error instanceof FileSystemError) {
        handleError(error, `File System - ${context}`, options);
    } else {
        handleError(
            new FileSystemError(`Unexpected error in ${context}`, error),
            context,
            options
        );
    }
};

/**
 * Specific handler for pattern matching errors
 */
export const handlePatternError = (
    error: unknown,
    pattern: string,
    context: string,
    options: ErrorHandlerOptions = {}
): void => {
    if (error instanceof PatternError) {
        handleError(error, `Pattern Matching - ${context}`, options);
    } else {
        handleError(
            new PatternError(`Error processing pattern: ${pattern}`, pattern, error),
            context,
            options
        );
    }
};