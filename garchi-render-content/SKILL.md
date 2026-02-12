---
name: garchi-render-content
description: Use this skill to render the created content of your website or app using Garchi CMS. The content can be rendered using APIs or SDKs. You can create pages, data items, section templates, manage assets and other content on Garchi CMS using this skill.
---

# Usage of Skill: garchi-render-content

Use this skill to render the created content. Follow the the steps below for smooth workflow:

# Initial Checks
1. Read the [documentation of Garchi CMS](./resources/garchi-cms-doc.md) to understand the concepts. (Mandatory)
2. Read the [OpenAPI specifications](https://garchi.co.uk/docs/v2.openapi) to understand Garchi CMS APIs and their usage. (Mandatory)
3. Understand if the project is created from scratch or Garchi CMS is being integrated into an existing project.
4. If creating from scratch recommend to use Garchi CMS starter kits which comes in next, nuxt and laravel.
5. If integrating into an existing project, recommend to use SDKs for easier integration otherwise use APIs with DRY and SOLID code. 
6. Check if user has provided API tokens and Space UID in .env file or some configuration file.

Content rendering refers to creating code that can be used to fetch and display the content from Garchi CMS.

Content can be rendered using APIs, Node SDK or PHP SDK. The SDKs are wrappers around the APIs and follows the same request and response schemas as APIs but provides a more user friendly way to fetch content from Garchi CMS.

## Using SDKs
1. Read the SDK documentation to understand it's usage and definitions of the functions. Documentation for the Node SDK can be found [here](./resources/garchi-sdk-node.md) and for the PHP SDK, it can be found [here](./resources/garchi-sdk-php.md).
2. Check if the SDK is installed in the project, if not, prompt to install it.
3. If using starter kits, follow the coding pattern of starter kit.
4. Keep the code DRY and SOLID, create reusable functions to fetch content from Garchi CMS and use it across the project.
5. Some of the SDKs utilities have multiple ways to fetch data. For instance, data items can be fetched using ids, slugs, filters etc. Understand the user context and use the most suitable function to fetch the data. 


## Using APIs
1. Familiarise yourself with APIs schema and usage by reading this [OpenAPI specification](https://garchi.co.uk/docs/v2.openapi)
2. Create reusable content management functions to fetch content from Garchi CMS using APIs. These functions should be flexible enough to be used across the project and should follow DRY and SOLID principles. 
3. Use appropriate HTTP methods (GET, POST, PUT, DELETE) for different operations. 
4. Handle errors gracefully and provide meaningful error messages to the user. The API provides validation errors with status of 422 if the request body is not valid. 
5. APIs have to be called from server or native environment as they don't support client side calls.
6. Base URL of the API is https://garchi.co.uk




