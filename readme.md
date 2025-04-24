# CogniLink Assistant

An Obsidian plugin for AI-enhanced knowledge management, leveraging advanced AI capabilities to enhance your note-taking and knowledge organization experience.

## Technology Stack

### Core Technologies
- **TypeScript** - Primary programming language
- **Node.js** - Runtime environment
- **Obsidian Plugin API** - For plugin integration with Obsidian
- **Model Context Protocol SDK** - For AI functionality integration
- **Smithery SDK** - For additional functionality

### Development Tools
- **ESBuild** - Bundler and build tool
- **TypeScript** - Type checking and compilation
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Project Structure

```
cognilink-assistant/
├── src/                    # Source code files
├── dist/                   # Compiled output
├── tests/                  # Test files
├── docs/                   # Documentation
├── esbuild.config.mjs      # ESBuild configuration
├── package.json           # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── .eslintrc            # ESLint configuration
```

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Obsidian (latest version)

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd cognilink-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a development environment:
   ```bash
   npm run dev
   ```

## Development Workflow

### Available Scripts

- `npm run dev` - Start development mode with hot-reload
- `npm run build` - Build production version
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### Development Mode

1. Start the development server:
   ```bash
   npm run dev
   ```
2. The plugin will be compiled and hot-reloaded when changes are made
3. View your changes in Obsidian (make sure the plugin is enabled)

### Building for Production

1. Run the build command:
   ```bash
   npm run build
   ```
2. The compiled plugin will be available in the `dist` directory

## Testing

- Write tests in the `tests` directory
- Follow the Jest testing framework conventions
- Run tests with `npm test`
- Aim for good test coverage of new features

## Code Style & Linting

We follow strict coding standards to maintain code quality:

- Use TypeScript for all new code
- Follow ESLint rules (see `.eslintrc`)
- Format code using Prettier
- Run linting before committing: `npm run lint`
- Fix linting issues: `npm run lint:fix`
- Format code: `npm run format`

## Debugging

- Use Chrome DevTools for debugging (available in Obsidian Developer Tools)
- Enable debug logs in development mode
- Check console for errors and warnings

## Contributing Guidelines

1. Create a new branch for your feature/fix
2. Write clear, commented code
3. Include tests for new features
4. Update documentation as needed
5. Follow the code style guidelines
6. Submit a pull request with a clear description

## Common Issues & Solutions

### Development Environment
- If hot-reload isn't working, restart Obsidian
- Clear the `.cache` directory if build issues occur
- Check Node.js and npm versions if setup fails

### Build Issues
- Run `npm clean-install` to resolve dependency issues
- Check for TypeScript errors: `tsc --noEmit`
- Verify ESBuild configuration in `esbuild.config.mjs`

## Contact & Support

For internal support and questions:
- Check the `docs` directory for detailed documentation
- Contact the development team through internal channels
- Report bugs through the issue tracker

## License

MIT License - See LICENSE file for details
