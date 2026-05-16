# Gemini MCP Server

An MCP (Model Context Protocol) server that allows AI assistants to interact with Google Gemini models via the AI Studio API.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Google AI Studio API Key](https://aistudio.google.com/app/apikey)

## Setup

1. **Clone or create the project directory.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Build the project:**
   ```bash
   npm run build
   ```

## Configuration

### Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["/absolute/path/to/gemini-mcp-server/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

Replace `/absolute/path/to/gemini-mcp-server` with the actual path on your system.

## Tools Provided

- `generate_content`: Generate text or code using a Google Gemini model.
  - `prompt` (string, required): The prompt to send.
  - `modelName` (string, optional): The model to use (default: `gemini-1.5-flash`).
  - `temperature` (number, optional): Sampling temperature (default: `0.7`).

## Security

- Never commit your `GEMINI_API_KEY` to version control.
- Use environment variables or a secure secret manager to handle the API key.
