import * as fs from 'fs';
import * as path from 'path';

/**
 * Represents a file's information including its path and content
 */
interface FileInfo {
    /** Relative path to the file from the root directory */
    path: string;
    /** Content of the file */
    content: string;
}

/**
 * Represents a directory structure containing files and subdirectories
 */
interface DirectoryStructure {
    /** List of files in the directory */
    files?: FileInfo[];
    /** Map of subdirectory names to their structures */
    dirs?: Record<string, DirectoryStructure>;
}

/**
 * Represents a pattern for including files in the capture
 */
interface IncludePattern {
    /** Pattern to match file paths against */
    pattern: string;
    /** Whether the pattern is a regular expression */
    isRegex: boolean;
}

/**
 * Class for capturing a codebase structure and content based on inclusion patterns
 */
class CodebaseCapture {
    /**
     * Set of directory and file names to ignore by default
     * @private
     */
    private readonly ignorePatterns = new Set([
        'node_modules',
        'dist',
        'build',
        'coverage',
        '.git',
        '.cache',
        '.next',
        '__pycache__',
        '.DS_Store',
        'package-lock.json',
        'paste.txt',
        'codebase-snapshot.json'
    ]);

    /**
     * List of patterns for files/directories to include
     * @private
     */
    private includePatterns: IncludePattern[] = [];
    
    /**
     * Root directory for the capture operation
     * @private
     */
    private rootDir: string = '';

    /**
     * Creates an instance of CodebaseCapture
     * @param {string} [csvPath='input.csv'] - Path to CSV file containing include patterns
     */
    constructor(private readonly csvPath: string = 'input.csv') {}

    /**
     * Parses pattern input from CSV content
     * @private
     * @param {string} content - CSV file content to parse
     * @returns {IncludePattern[]} Array of parsed include patterns
     */
    private parsePatternInput(content: string): IncludePattern[] {
        if (!content.trim()) {
            // If no patterns provided, include everything
            return [{
                pattern: '**/*',
                isRegex: false
            }];
        }

        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => {
                const [pattern, typeStr = 'simple'] = line.split(',').map(s => s.trim());
                return {
                    pattern: pattern.replace(/^\.\//, ''),
                    isRegex: typeStr.toLowerCase() === 'regex'
                };
            });
    }

    /**
     * Loads include patterns from CSV file
     * @private
     * @throws {Error} If file read fails, falls back to including all files
     */
    private loadPatterns(): void {
        try {
            // If the CSV file doesn't exist, include everything
            if (!fs.existsSync(this.csvPath)) {
                console.log('No patterns file found, including all files by default');
                this.includePatterns = [{
                    pattern: '**/*',
                    isRegex: false
                }];
                return;
            }

            const content = fs.readFileSync(this.csvPath, 'utf-8');
            this.includePatterns = this.parsePatternInput(content);
            
            console.log('Loaded include patterns:');
            this.includePatterns.forEach(p => {
                console.log(`  ${p.isRegex ? 'Regex' : 'Simple'}: ${p.pattern}`);
            });
        } catch (error) {
            console.error(`Error reading patterns file: ${this.csvPath}`);
            console.error('Including all files by default');
            this.includePatterns = [{
                pattern: '**/*',
                isRegex: false
            }];
        }
    }

    /**
     * Determines if a file/directory should be included in the capture
     * @private
     * @param {string} entryPath - Full path to the file/directory
     * @returns {boolean} True if the entry should be captured
     */
    private shouldCapture(entryPath: string): boolean {
        const relativePath = path.relative(this.rootDir, entryPath).replace(/\\/g, '/');
        const basename = path.basename(entryPath);
        
        if (this.ignorePatterns.has(basename)) {
            return false;
        }

        // If no patterns are specified, include everything except ignored files
        if (this.includePatterns.length === 0) {
            return true;
        }

        return this.includePatterns.some(pattern => {
            if (pattern.isRegex) {
                try {
                    const regex = new RegExp(pattern.pattern);
                    return regex.test(relativePath);
                } catch (e) {
                    console.warn(`Invalid regex pattern: ${pattern.pattern}`);
                    return false;
                }
            } else {
                // Convert glob pattern to regex
                const globToRegex = pattern.pattern
                    .replace(/\./g, '\\.')
                    .replace(/\*\*/g, '.*')
                    .replace(/\*/g, '[^/]*');
                const regex = new RegExp(globToRegex);
                return regex.test(relativePath);
            }
        });
    }

    /**
     * Reads file content with error handling
     * @private
     * @param {string} filepath - Path to the file to read
     * @returns {string} File content or empty string if read fails
     */
    private readFileContent(filepath: string): string {
        try {
            return fs.readFileSync(filepath, { encoding: 'utf-8' });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.warn(`Error reading file ${filepath}: ${errorMessage}`);
            return '';
        }
    }

    /**
     * Recursively scans a directory and constructs its structure
     * @private
     * @param {string} currentPath - Path to scan
     * @returns {DirectoryStructure} Scanned directory structure
     */
    private scanDirectory(currentPath: string): DirectoryStructure {
        const structure: DirectoryStructure = {};
        
        try {
            const entries = fs.readdirSync(currentPath, { withFileTypes: true });

            const files = entries
                .filter(entry => entry.isFile())
                .filter(entry => this.shouldCapture(path.join(currentPath, entry.name)))
                .map(file => ({
                    path: path.relative(this.rootDir, path.join(currentPath, file.name)).replace(/\\/g, '/'),
                    content: this.readFileContent(path.join(currentPath, file.name))
                }))
                .filter(file => file.content !== ''); // Remove empty files

            if (files.length > 0) {
                structure.files = files;
            }

            const directories = entries
                .filter(entry => entry.isDirectory() && !this.ignorePatterns.has(entry.name));
            
            if (directories.length > 0) {
                structure.dirs = {};
                for (const dir of directories) {
                    const fullPath = path.join(currentPath, dir.name);
                    const subStructure = this.scanDirectory(fullPath);
                    if (Object.keys(subStructure).length > 0) {
                        structure.dirs[dir.name] = subStructure;
                    }
                }
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error(`Error scanning directory ${currentPath}: ${errorMessage}`);
        }

        return structure;
    }

    /**
     * Formats directory structure into a string output
     * @private
     * @param {DirectoryStructure} structure - Directory structure to format
     * @returns {string} Formatted string with file contents
     */
    private formatOutput(structure: DirectoryStructure): string {
        let output = '';

        const processFiles = (files: FileInfo[]) => {
            for (const file of files) {
                output += `\n\n=== File: ${file.path} ===\n`;
                output += file.content;
            }
        };

        const processDirs = (dirs: Record<string, DirectoryStructure>) => {
            for (const [, dirStructure] of Object.entries(dirs)) {
                if (dirStructure.files) {
                    processFiles(dirStructure.files);
                }
                if (dirStructure.dirs) {
                    processDirs(dirStructure.dirs);
                }
            }
        };

        if (structure.files) {
            processFiles(structure.files);
        }
        if (structure.dirs) {
            processDirs(structure.dirs);
        }

        return output.trim();
    }

    /**
     * Main method to execute codebase capture
     * @param {string} rootDir - Root directory to capture
     */
    public capture(rootDir: string): void {
        console.log('Starting codebase capture...');
        this.rootDir = rootDir;
        
        this.loadPatterns();
        console.log('\nScanning directory...');
        
        const structure = this.scanDirectory(rootDir);
        const output = this.formatOutput(structure);
        
        if (!output) {
            console.error('No files were captured! Check your patterns and paths.');
            return;
        }

        fs.writeFileSync('paste.txt', output, { encoding: 'utf-8' });
        console.log('Codebase capture complete!');
        console.log('Output saved to: paste.txt');
    }
}

// Command-line execution support
if (require.main === module) {
    const args = process.argv.slice(2);
    const rootDir = args[0] || process.cwd();
    const csvPath = args[1] || 'input.csv';

    const capture = new CodebaseCapture(csvPath);
    capture.capture(rootDir);
}