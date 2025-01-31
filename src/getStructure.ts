import * as fs from 'fs';
import {
    DirectoryScanner,
    DirectoryNode,
    FileNode,
    ScannerOptions
} from './utils';

class StructureScanner {
    private formatTree(node: DirectoryNode | FileNode, level: number = 0): string {
        const indent = ' '.repeat(level * 2);
        const type = node.type === 'directory' ? '📁' : '📄';
        const tokenInfo = node.type === 'file' && 'tokenCount' in node && node.tokenCount !== undefined
            ? ` [${node.tokenCount} tokens]`
            : '';
            
        let output = `${indent}${type} ${node.name} (${node.path}${tokenInfo})\n`;
        
        if (node.type === 'directory') {
            output += node.children
                .sort((a, b) => {
                    // Sort by type (directories first) then by name
                    if (a.type !== b.type) {
                        return a.type === 'directory' ? -1 : 1;
                    }
                    return a.name.localeCompare(b.name);
                })
                .map(child => this.formatTree(child, level + 1))
                .join('');
        }
        
        return output;
    }

    private generatePrompt(structure: string): string {
        return [
            'I need you to help me solve for the current issue I am facing or trying to solve or support me in devolpment in general of the following app',
            'Current directory structure:',
            structure,
            '',
            'The /summaries directory contains prioritized overview summaries that should be analyzed first.',
            '',
            'Token-efficient analysis requirements:',
            '1. Essential Context Files (Prioritize Conciseness):',
            '   - grab stuff like readme.md or documentation files.',
            '   - Add other summaries if needed for current analysis',
            '',
            '2. Critical Code Sections (3-5 Key Items Max):',
            '',
            '3. Context Gaps (2-3 Critical Items):',
            '   - Only missing summaries that block understanding',
            '   - Ambiguities with actual code impact',
            '',
            'Generate input.csv using EXACT format:',
            'filepath',
            'summaries/overview.md',
            'summaries/architecture.md',
            '',
            'CSV Rules:',
            '- Preserve exact header: "filepath"',
            '',
            'Token Conservation:',
            '- take into account the token size for each file you include in the csv and try to stay under 10k tokens total',
           
        ].join('\n');
    }

    public scan(rootDir: string): string {
        const options: ScannerOptions = {
            calculateTokens: true,
            rootDir,
            additionalIgnorePatterns: new Set(['paste.txt']),
            extendDefaults: true
        };

        const scanner = new DirectoryScanner(options);
        const tree = scanner.scan();
        const formatted = this.formatTree(tree, 0);
        return this.generatePrompt(formatted);
    }
}

if (require.main === module) {
    (async () => {
        const scanner = new StructureScanner();
        const prompt = scanner.scan(process.cwd());
        
        fs.writeFileSync('paste.txt', prompt, 'utf-8');

        try {
            const { default: clipboardy } = await import('clipboardy');
            clipboardy.writeSync(prompt);
            console.log('✅ Output saved to clipboard and paste.txt');
        } catch (error) {
            console.log('⚠️ Output saved to paste.txt');
        }
    })();
}

export const scan = (rootDir: string): string => {
    const scanner = new StructureScanner();
    return scanner.scan(rootDir);
};