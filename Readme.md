# Scripts Documentation

This directory contains utility scripts for codebase analysis, structure visualization, and file summarization. These tools are designed to help developers and AI systems better understand and interact with the codebase.

## Table of Contents
- [Scripts Overview](#scripts-overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Codebase Capture](#codebase-capture)
  - [Git Diff Generation](#git-diff-generation)
  - [Directory Structure Analysis](#directory-structure-analysis)
  - [File Summarization](#file-summarization)

## Scripts Overview

### 🗂️ `captureCodebase.ts`
Captures a snapshot of your codebase while respecting include/exclude patterns. Useful for documentation and analysis.

**Key Features:**
- Configurable file inclusion via CSV patterns
- Smart directory/file filtering
- Support for regex and simple pattern matching
- Outputs formatted content to `paste.txt`

### 📊 `diff.ts`
Generates formatted Git diffs with commit message templates. Perfect for code review and documentation.

**Key Features:**
- Capture staged changes
- Generates commit message templates
- Ignores whitespace changes
- Includes bash script header for easy execution

### 🌳 `getStructure.ts`
Creates a visual representation of your codebase structure with token counting for files.

**Key Features:**
- Tree-style directory visualization
- Token count estimation for files
- Generates LLM-friendly prompts with directory structure
- Clipboard support for easy sharing
- Single output format optimized for LLM interaction

### 📝 `rag.ts`
Generates AI-powered summaries of code files using Claude 3 Haiku. Maintains a cache of summaries and updates them when files change.

**Key Features:**
- Automatic file change detection
- Cached summaries with metadata
- Configurable file type filtering
- Hierarchical summary storage
- Error handling and recovery

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Required for rag.ts
ANTHROPIC_API_KEY=your_api_key
```

## Configuration

### Common Ignore Patterns
All scripts use similar ignore patterns for consistency:
```typescript
const ignorePatterns = [
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
];
```

### Include Patterns (captureCodebase.ts)
Create an `input.csv` file to specify which files to include:
```csv
# Format: pattern,type
# Types: simple, regex
src/**/*.ts,simple
test/.*\.spec\.ts,regex
```

### File Extensions
Default included extensions:
```typescript
const includeExtensions = [
  '.ts',
  '.tsx',
  '.txt',
  '.js',
  '.jsx',
  '.json',
  '.d.ts'
];
```

## Usage

### Codebase Capture

```bash
# Basic usage (uses current directory)
npm run capture

# Specify directory and pattern file
npm run capture /path/to/project /path/to/patterns.csv

# Verbose output
npm run capture:verbose
```

### Git Diff Generation

```bash
# Capture staged changes
npm run diff

# Compare with specific branch/commit
npm run diff origin/main

# Verbose output
npm run diff:verbose
```

### Directory Structure Analysis

```bash
# Generate structure files
npm run structure

# Outputs:
# - paste.txt (LLM instruction prompt with directory structure)
```

### File Summarization

```bash
# Generate summaries for all matching files
npm run rag

# Summaries are stored in /summaries directory
# Format: /summaries/path/to/file.ts.summary.json
```

## Output Files

### `paste.txt`
- Generated by multiple scripts
- Contains formatted output ready for sharing
- Different format depending on the script:
  - `captureCodebase.ts`: Full file contents
  - `diff.ts`: Git diff with commit template
  - `getStructure.ts`: LLM instruction prompt



### Summary Files
- Generated by `rag.ts`
- Stored in `/summaries` directory
- JSON format with metadata:
  ```json
  {
    "filePath": "relative/path/to/file.ts",
    "summary": "AI-generated summary content",
    "lastUpdated": "ISO timestamp",
    "fileHash": "MD5 hash for change detection"
  }
  ```

## Error Handling

All scripts include robust error handling:
- File system errors
- Pattern parsing errors
- Git command failures
- API communication errors
- JSON parsing/writing errors

## Contributing

When modifying these scripts, please:
1. Maintain consistent ignore patterns
2. Update documentation for new features
3. Test with various file types and structures
4. Keep error handling comprehensive
5. Follow existing code style

## Notes

- Token counting is an estimate (4 characters = 1 token)
- Summaries are generated using Claude 3 Haiku
- Git diff capture requires a git repository
- Large files may impact performance