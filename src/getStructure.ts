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
            'Current directory structure:',
            structure,
            '',
            'The /summaries directory contains overview summaries for most files.',
            '',
            'Please provide your analysis in these steps:',
            '1. List files needed to understand the context',
            '2. Specific code sections to focus on',
            '3. Areas where you need additional context',
            ''
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