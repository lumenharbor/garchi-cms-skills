---
name: garchi-cms-content
description: Use this skill to render the created content of your website or app using Garchi CMS. The content can be rendered using APIs or SDKs. You can create pages, data items, section templates, manage assets and other content on Garchi CMS using this skill.
---

# Usage of Skill: garchi-cms-content

Use this skill to render the created content. Follow the the steps below for smooth workflow:

1. Ask user to integrate GarchiCMS MCP server in the AI client if not already done. Documentation can be found at https://garchi.co.uk/mcp-docs
2. Use MCP tools, resources and prompts as required to create content on Garchi CMS.
3. Garchi CMS is a headless CMS so use the APIs or SDKs to render the content on the app or website.
4. For SDK documentation read files from resources/garchi-sdk-node.md and resources/garchi-sdk-php.md respectively.
5. For API documentation visit openapi specification at https://garchi.co.uk/docs/v2.openapi
6. Read about Garchi CMS in detail from the file resources/garchi-cms-doc.md
7. Use the code-snippets from the file resources/code-snippets.md as reference to generate code for rendering content using APIs or SDKs.

# Ideal flow

1. User creates content on Garchi CMS either using the dashboard, APIs, SDKs or ask you to create content for them using MCP tools.
2. You ask user how they want to render the content on their app or website, using APIs or SDKs.
3. You generate the code for rendering the content using APIs or SDKs as per user's choice and provide it to them.
4. Prompt user to use starter kits for quick integration. Starter kits are only suitable for fresh projects. 
5. If using starter kits, read the files of starter kits from the codebase and provide the relevant code snippets to the user for integration leveraging the referenced information from resources/code-snippets.md
6. If not using starter kits, generate the code snippets for integration using APIs or SDKs as per user's choice and provide it to them.
7. If you don't find relevant information on SDK usage, read the sdk code from node_modules or vendor folders respectively.
