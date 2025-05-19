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
├── scripts/               # Build and deployment scripts
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
- `npm run deploy` - Build and deploy to test vault (see below)
- `npm run clean` - Clean build artifacts
- `npm run validate` - Run all validations (lint, test, build)

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

### Deployment and Testing

#### Manual Deployment

1. Build the plugin:
   ```bash
   npm run build
   ```

2. Copy the built files to your Obsidian test vault:
   ```bash
   cp dist/main.js manifest.json styles.css ~/Documents/CogniLink-Test/.obsidian/plugins/cognilink-assistant/
   ```

3. Reload Obsidian or restart the plugin

#### Automated Deployment

We provide a deployment script (`scripts/deploy.sh`) that automates the build and deployment process:

```bash
#!/bin/bash

# Configuration
TEST_VAULT_PATH="$HOME/Documents/CogniLink-Test"
PLUGIN_NAME="cognilink-assistant"
PLUGIN_PATH="$TEST_VAULT_PATH/.obsidian/plugins/$PLUGIN_NAME"

# Create plugin directory if it doesn't exist
mkdir -p "$PLUGIN_PATH"

# Build the plugin
echo "Building plugin..."
npm run build

# Copy files to test vault
echo "Deploying to test vault..."
cp dist/main.js "$PLUGIN_PATH/"
cp manifest.json "$PLUGIN_PATH/"
cp styles.css "$PLUGIN_PATH/"

echo "Deployment complete!"
```

To use the automated deployment:

1. Add the script to your project:
   ```bash
   mkdir -p scripts
   touch scripts/deploy.sh
   chmod +x scripts/deploy.sh
   ```

2. Add the script to your `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "./scripts/deploy.sh"
     }
   }
   ```

3. Run the deployment:
   ```bash
   npm run deploy
   ```

### Testing in Obsidian

#### Setting Up a Test Vault

1. Create a test vault in Obsidian:
   - Open Obsidian
   - Click "Create new vault"
   - Name it "CogniLink-Test"
   - Choose a location (e.g., `~/Documents/CogniLink-Test`)

2. Enable developer mode:
   - Open Settings
   - Go to "About"
   - Click "Developer mode" to enable it

#### Development Testing

1. Start development mode:
   ```bash
   npm run dev
   ```

2. Deploy to test vault:
   ```bash
   npm run deploy
   ```

3. In Obsidian:
   - Open the test vault
   - Go to Settings > Community Plugins
   - Enable "CogniLink Assistant"
   - Reload the plugin if needed

#### Production Testing

1. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

2. Test in Obsidian:
   - Open the test vault
   - Verify all features work as expected
   - Check for any console errors

### Debugging

#### Development Debugging

1. Enable debug logs:
   - Open Obsidian
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)
   - Go to Console tab
   - Filter for "CogniLink" to see plugin logs

2. Common debugging tasks:
   - Check for build errors in terminal
   - Verify plugin is loaded in Obsidian
   - Monitor network requests
   - Check for JavaScript errors

#### Production Debugging

1. Enable developer tools:
   - Open Obsidian
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)
   - Go to Console tab

2. Debug steps:
   - Check for JavaScript errors
   - Verify API calls
   - Monitor performance
   - Check memory usage

### Common Issues & Solutions

#### Build Issues

1. **Build fails**
   - Check TypeScript errors: `npm run build`
   - Verify dependencies: `npm install`
   - Clean and rebuild: `npm run clean && npm run build`

2. **Plugin not loading**
   - Verify file permissions
   - Check manifest.json version
   - Ensure all required files are present

#### Deployment Issues

1. **Files not copying**
   - Check test vault path
   - Verify file permissions
   - Ensure plugin directory exists

2. **Plugin not appearing**
   - Check plugin directory structure
   - Verify manifest.json
   - Restart Obsidian

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Exception Handling & Testing

### Exception Scenarios

- **Missing Anthropic API Key**: If the AI provider is set to `anthropic` and the API key is missing, the plugin will throw a `ConfigurationError` with the message `Anthropic API key is missing`.
- **Unsupported Provider**: If the AI provider is set to an unsupported value, the plugin will throw an error with the message `Unsupported AI provider`.

### How to Test Exception Handling in Obsidian

1. **Test Missing Anthropic API Key**
   - Go to the plugin settings in Obsidian.
   - Set the AI provider to `anthropic`.
   - Leave the API key field empty or enter an invalid value.
   - Save settings and trigger an AI action (e.g., send a message).
   - **Expected:** You should see an error notification or message: `Anthropic API key is missing`. Check the developer console for error logs.

2. **Test Unsupported Provider**
   - Manually edit the plugin's settings file (e.g., `.obsidian/plugins/<plugin-id>/settings.json`) and set `ai.provider` to an invalid value (e.g., `foobar`).
   - Reload Obsidian or the plugin.
   - Trigger an AI action.
   - **Expected:** You should see an error notification or message: `Unsupported AI provider`. Check the developer console for error logs.

### Unit Testing

- Exception branches are covered by unit tests in `src/services/__tests__/AIService.test.ts` and `SettingsManager.test.ts`.
- Tests assert that the correct error is thrown for missing API keys and unsupported providers, both synchronously and asynchronously.
- Run all tests with:
  ```bash
  npm test
  ```
- For failed tests, check the error message output and ensure your environment matches the documented requirements.
