import {
    DirectoryScanner,
    FilePattern,
    FileNode,
    DirectoryNode,
    PatternMatcher,
    FileReader,
    handleFileSystemError,
    PathUtils
} from './utils';
import * as fs from 'fs';

/**
 * Class for capturing a codebase structure and content based on inclusion patterns
 */
class CodebaseCapture {
    private patterns: FilePattern[] = [];
    
    constructor(private readonly patternsPath: string = 'input.csv') {}

    /**
     * Loads include patterns from file
     */
    private loadPatterns(): void {
        try {
            if (!PathUtils.validatePath(this.patternsPath)) {
                console.log('No patterns file found, including all files by default');
                this.patterns = [PatternMatcher.createPattern('**/*')];
                return;
            }

            const content = FileReader.readFileSync(this.patternsPath);
            this.patterns = PatternMatcher.parsePatternInput(content);
            
            console.log('Loaded include patterns:');
            this.patterns.forEach(p => {
                console.log(`  ${p.isRegex ? 'Regex' : 'Simple'}: ${p.pattern}`);
            });
        } catch (error) {
            handleFileSystemError(error, `Error reading patterns file: ${this.patternsPath}`);
            this.patterns = [PatternMatcher.createPattern('**/*')];
        }
    }

    /**
     * Formats node tree into file content output
     */
    private formatOutput(node: DirectoryNode | FileNode, result: string[] = []): string[] {
        if (node.type === 'file' && 'content' in node && node.content) {
            result.push(`\n=== File: ${node.path} ===\n`);
            result.push(node.content);
        } else if (node.type === 'directory') {
            // Process child nodes
            node.children
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(child => this.formatOutput(child, result));
        }
        
        return result;
    }

    /**
     * Main method to execute codebase capture
     */
    public capture(rootDir: string): void {
        console.log('Starting codebase capture...');
        
        try {
            // Load patterns first
            this.loadPatterns();
            console.log('\nScanning directory...');
            
            // Configure and create scanner
            const scanner = new DirectoryScanner({
                rootDir,
                includePatterns: this.patterns,
                additionalIgnorePatterns: new Set(['paste.txt', 'codebase-snapshot.json']),
                storeFileContent: true // Ensure we capture file content
            });

            // Scan directory
            const tree = scanner.scan();
            
            // Format output
            const output = this.formatOutput(tree).join('');
            
            if (!output.trim()) {
                console.error('No files were captured! Check your patterns and paths.');
                return;
            }

            // Save output
            fs.writeFileSync('paste.txt', output, { encoding: 'utf8' });
            console.log('Codebase capture complete!');
            console.log('Output saved to: paste.txt');

        } catch (error) {
            handleFileSystemError(error, 'Error during codebase capture');
        }
    }
}

// Command-line execution support
if (require.main === module) {
    const args = process.argv.slice(2);
    const rootDir = args[0] || process.cwd();
    const patternsPath = args[1] || 'input.csv';

    const capture = new CodebaseCapture(patternsPath);
    capture.capture(rootDir);
}

export const captureCodebase = (rootDir: string, patternsPath?: string): void => {
    const capture = new CodebaseCapture(patternsPath);
    capture.capture(rootDir);
};