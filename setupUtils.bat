@echo off
echo Creating new module structure...

REM Create main directories
mkdir src\utils\fs
mkdir src\utils\patterns
mkdir src\utils\errors
mkdir src\utils\types

REM Create utility files
echo // File system utilities > src\utils\fs\directoryScanner.ts
echo // File reading utilities > src\utils\fs\fileReader.ts
echo // Path manipulation helpers > src\utils\fs\pathUtils.ts

REM Create pattern files
echo // Shared ignore patterns > src\utils\patterns\ignorePatterns.ts
echo // Pattern matching logic > src\utils\patterns\patternMatcher.ts

REM Create error handling files
echo // Custom error types > src\utils\errors\customErrors.ts
echo // Shared error handling > src\utils\errors\errorHandler.ts

REM Create type definitions
echo // Shared directory/file interfaces > src\utils\types\directory.ts

REM Create index file
echo // Export all utilities > src\utils\index.ts

echo.
echo Directory structure created! The following files have been initialized:
echo.
echo src\utils\fs\directoryScanner.ts
echo src\utils\fs\fileReader.ts
echo src\utils\fs\pathUtils.ts
echo src\utils\patterns\ignorePatterns.ts
echo src\utils\patterns\patternMatcher.ts
echo src\utils\errors\customErrors.ts
echo src\utils\errors\errorHandler.ts
echo src\utils\types\directory.ts
echo src\utils\index.ts
echo.
echo Please check the files and start implementing the utilities.