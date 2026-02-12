<p align="center">
  <a href="https://garchi.co.uk">
    <img src="Logo.png" alt="Garchi Logo" height="70" title="Garchi" />
  </a>
</p>

<h1 align="center">Garchi CMS Agent Skills</h1>

This package includes required agent skill for rendering content in your codebase from Garchi CMS.

It's recommended to refer documentations as agents can make mistakes.

- [API Documentation](https://garchi.co.uk/docs/v2)
- [Garchi CMS Documentation](https://garchi.co.uk/documentation)
- [MCP Documentation](https://garchi.co.uk/mcp-docs)

# Usage

You need to install Garchi CMS MCP server in your AI client. 

1. [Cursor IDE](https://garchi.co.uk/mcp-docs#cursor-ide)
2. [Claude](https://garchi.co.uk/mcp-docs#claude-integration)
3. [Lovable](https://garchi.co.uk/mcp-docs#lovable)
4. [v0](https://garchi.co.uk/mcp-docs#v0)
5. [VS Code Copilot](https://garchi.co.uk/mcp-docs#vscode)
6. [Other clients](https://garchi.co.uk/mcp-docs#other-clients)


After setting up the Garchi CMS MCP server you can add the skill by running the command below

```bash
npx skills add lumenharbor/garchi-cms-skills
```

In Claude Desktop, you can add the skill by following the steps below

1. Open Claude Desktop and find Cowork Tab.
2. Click on Plugins from left side bar
3. In the Browse Plugins popup, select Add marketplace from GitHub
4. In the URL type lumenharbor/garchi-cms-skills and click Sync


Once the skill is installed you can use it by typing ```/garchi-render-content``` in the input followed by your prompt.

