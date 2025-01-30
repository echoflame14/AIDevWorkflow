import { FilePattern } from '../types/directory';
import { PatternError } from '../errors/customErrors';

export class PatternMatcher {
    /**
     * Converts a glob pattern to a regular expression
     */
    private static globToRegex(pattern: string): string {
        return pattern
            .replace(/[.]/g, '\\.')   // Escape dots
            .replace(/\*\*/g, '.*')   // ** matches anything
            .replace(/\*/g, '[^/]*')  // * matches anything except path separator
            .replace(/\?/g, '.');     // ? matches any single character
    }

    /**
     * Tests a path against a glob pattern
     */
    static matchGlobPattern(path: string, pattern: string): boolean {
        try {
            const regexPattern = this.globToRegex(pattern);
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(path);
        } catch (error) {
            throw new PatternError(
                `Invalid glob pattern: ${pattern}`,
                pattern,
                error
            );
        }
    }

    /**
     * Tests a path against a regex pattern
     */
    static matchRegexPattern(path: string, pattern: string): boolean {
        try {
            const regex = new RegExp(pattern);
            return regex.test(path);
        } catch (error) {
            throw new PatternError(
                `Invalid regex pattern: ${pattern}`,
                pattern,
                error
            );
        }
    }

    /**
     * Tests a path against any pattern (glob or regex)
     */
    static matchPattern(path: string, pattern: FilePattern): boolean {
        return pattern.isRegex
            ? this.matchRegexPattern(path, pattern.pattern)
            : this.matchGlobPattern(path, pattern.pattern);
    }

    /**
     * Tests a path against multiple patterns
     */
    static matchAnyPattern(path: string, patterns: FilePattern[]): boolean {
        return patterns.some(pattern => this.matchPattern(path, pattern));
    }

    /**
     * Creates a FilePattern from a string
     */
    static createPattern(pattern: string, isRegex: boolean = false): FilePattern {
        return {
            pattern: pattern.replace(/^\.\//, ''), // Remove leading ./
            isRegex
        };
    }

    /**
     * Parses patterns from CSV content
     */
    static parsePatternInput(content: string): FilePattern[] {
        if (!content.trim()) {
            return [this.createPattern('**/*')];
        }

        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => {
                const [pattern, typeStr = 'simple'] = line.split(',').map(s => s.trim());
                return this.createPattern(pattern, typeStr.toLowerCase() === 'regex');
            });
    }
}