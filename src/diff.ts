import { spawnSync } from 'child_process';
import { AppError, FileSystemError } from './utils/errors/customErrors';
import { handleError } from './utils/errors/errorHandler';
import { FileReader } from './utils/fs/fileReader';
import { PathUtils } from './utils/fs/pathUtils';

/**
 * Error thrown during Git operations
 */
export class GitError extends AppError {
    constructor(
        message: string,
        public readonly command: string,
        public readonly status: number,
        originalError?: unknown
    ) {
        super(message, 'GIT_ERROR', originalError);
    }
}

/**
 * A utility class for capturing git diffs and generating commit script files.
 */
export class DiffCapturer {
    /** @private @readonly Output filename for the generated commit script */
    private readonly outputFile: string;
    
    /**
     * Creates a DiffCapturer instance
     * @param {string} [outputPath='paste.txt'] - Path to output file
     * @param {boolean} [verbose=false] - Enable debug logging
     */
    constructor(
        outputPath: string = 'paste.txt',
        private verbose: boolean = false
    ) {
        this.outputFile = PathUtils.normalize(outputPath);
    }

    /**
     * Logs debug messages if verbose mode is enabled
     */
    private log(message: string): void {
        if (this.verbose) console.log(`[DEBUG] ${message}`);
    }

    /**
     * Executes git diff command with configured parameters
     */
    private executeGitDiff(target?: string): string {
        const args = [
            'diff',
            '--staged',
            '--src-prefix=a/',
            '--dst-prefix=b/',
            '--ignore-space-change',
            '--ignore-blank-lines',
            target || 'HEAD'
        ];
        const command = `git ${args.join(' ')}`;
        this.log(`Executing: ${command}`);
       
        const result = spawnSync('git', args, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'inherit']
        });

        // Handle null status (process didn't start) or non-zero status (process failed)
        if (result.status === null || result.status !== 0) {
            throw new GitError(
                `Git diff failed${result.status !== null ? ` with status ${result.status}` : ''}`,
                command,
                result.status ?? -1, // Use -1 as default status for null case
                result.error
            );
        }

        return result.stdout;
    }

    /**
     * Generates a commit script file containing diff output and commit template
     */
    public captureDiff(target?: string): void {
        try {
            const diffOutput = this.executeGitDiff(target);
            const commitPrompt = `#!/bin/bash
# Auto-generated commit command builder | paste into terminal
# INSTRUCTIONS:
# 1. AI should generate a single -m argument for semantic commits
# 2. Format: "type(scope): brief summary"
# 3. Use bullet points for detailed changes
# 4. Escape quotes with \\"
echo "Generated commit command:"
echo "git commit -m \\"`;

            const header = `# DIFF CONTENT BELOW - ${new Date().toISOString()}\n` +
                        `# git diff ${target || 'HEAD'}\n\n` +
                        `cat << 'EOF'\n`;
        
            const footer = `EOF\n`;
        
            const content = commitPrompt + header + diffOutput + footer;

            // Use FileReader to write the output file
            try {
                require('fs').writeFileSync(
                    this.outputFile,
                    content,
                    { mode: 0o755, encoding: 'utf-8' }
                );
                console.log(`✅ Generated paste-ready file: ${this.outputFile}`);
            } catch (error) {
                throw new FileSystemError(`Failed to write output file: ${this.outputFile}`, error);
            }
        } catch (error) {
            handleError(error, 'DiffCapturer.captureDiff', {
                debug: this.verbose,
                throwAfterHandle: true
            });
        }
    }
}

// Command-line interface handling
if (require.main === module) {
    try {
        const args = process.argv.slice(2);
        const target = args[0];
        const verbose = args.includes('--verbose');
    
        const capturer = new DiffCapturer('paste.txt', verbose);
        capturer.captureDiff(target);
    } catch (error) {
        handleError(error, 'diff.ts CLI', { throwAfterHandle: false });
        process.exit(1);
    }
}