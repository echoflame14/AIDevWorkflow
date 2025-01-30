# Codebase Analysis Tools

This directory contains utility scripts for codebase analysis, structure visualization, and file summarization. These tools are designed to help developers and AI systems better understand and interact with the codebase.

## Scripts Overview

### 🗂️ captureCodebase.ts

Captures a snapshot of your codebase while respecting include/exclude patterns. Useful for documentation and analysis.

**Key Features:**
- Configurable file inclusion via CSV patterns (simple/regex)
- Outputs matched file contents to paste.txt
- Built-in exclusion of common non-source directories

### 📊 diff.ts

Generates Git diffs for code review and documentation.

**Key Features:**
- Captures staged changes
- Includes whitespace-ignored diffs
- Requires an active Git repository

### 🌳 getStructure.ts

Creates a directory structure map with file token counts.

**Key Features:**
- Hierarchical directory tree output
- Token estimation (4 characters = 1 token)
- Copies LLM-friendly prompt to clipboard
- Writes structure to paste.txt

### 📝 rag.ts

Generates AI-powered file summaries using Claude 3 Haiku.

**Key Features:**
- Summary caching with MD5 hash validation
- Metadata tracking (timestamps, file paths)
- Configurable file extensions
- Error handling for API/file operations

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
echo "ANTHROPIC_API_KEY=your_api_key" >> .env  # Required for rag.ts
```

## Configuration

### Common Ignore Patterns

```typescript
[
  'node_modules', '.git', 'dist', 'build',
  '.next', '**__pycache__**', 'package-lock.json'
]
```

### File Extensions (Default)

```typescript
['.ts', '.js', '.tsx', '.jsx', '.json', '.txt', '.d.ts']
```

### Pattern File Example (input.csv)

```csv
# pattern,type
src/**/*.ts,simple
test/.*\.spec\.ts,regex
```

## Usage

### Codebase Capture

```bash
npm run capture [directory] [patterns.csv]
```

### Git Diff Generation

```bash
npm run diff [commit/branch]
```

### Directory Structure Analysis

```bash
npm run structure
```

### File Summarization

```bash
npm run rag
```

## Output Files

### paste.txt
- Capture: Selected file contents
- Structure: Directory tree with token counts
- Diff: Git diff output

### Summary Files (/summaries/*.json)

```json
{
  "filePath": "src/rag.ts",
  "summary": "AI-generated summary content",
  "lastUpdated": "ISO timestamp",
  "fileHash": "MD5 hash"
}
```

## Error Handling

All scripts include:
- File system error detection
- Pattern validation
- API error handling (rag.ts)
- JSON read/write safeguards

## Notes

- Token counting uses fixed 4:1 character-to-token ratio
- Requires Git repository for diff functionality
- First summary generation may take longer for large projects
- Keep .env file secure (contains API key)