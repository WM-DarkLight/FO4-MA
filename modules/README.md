# Fallout 4 Modding Assistant - Module System

## Overview

The module system allows you to extend the Fallout 4 Modding Assistant with custom knowledge modules. Each module contains a collection of knowledge entries related to a specific aspect of Fallout 4 modding.

## Module Structure

A module consists of a TypeScript file that exports a `ModuleDefinition` object. Each module must have:

- **id**: A unique identifier for the module
- **name**: The display name of the module
- **description**: A brief description of the module's content
- **version**: The module version (semver format)
- **author** (optional): The module creator's name
- **entries**: An array of knowledge entries
- **dependencies** (optional): Array of module IDs this module depends on

## Creating a New Module

### Step 1: Create a new TypeScript file

Create a new file in the `/modules` directory with a descriptive name (e.g., `texture-mods.ts`).

### Step 2: Define your module

Use the following template:

\`\`\`typescript
import type { ModuleDefinition } from "@/lib/types"
import { nanoid } from "@/lib/utils"

// Use a fixed ID for production stability
const moduleId = "your-module-id"

const module: ModuleDefinition = {
  id: moduleId,
  name: "Your Module Name",
  description: "Description of your module",
  version: "1.0.0",
  author: "Your Name",
  entries: [
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Entry Title",
      content: "Entry content with detailed information...",
      keywords: ["keyword1", "keyword2", "keyword3"],
    },
    // Add more entries as needed
  ],
}

export default module
\`\`\`

### Step 3: Register your module

Import and register your module in `app/page.tsx`:

\`\`\`typescript
// Import your module
import yourModule from "@/modules/your-module-file"

// In the initialize function:
moduleRegistry.registerModule(yourModule)
\`\`\`

## Knowledge Entry Structure

Each knowledge entry must have:

- **id**: A unique identifier (generated with nanoid)
- **moduleId**: The ID of the parent module
- **title**: The title of the knowledge entry
- **content**: The main content of the entry
- **keywords**: An array of keywords for search functionality

## Best Practices

1. **Organize related information** into a single module
2. **Use clear, descriptive titles** for entries
3. **Keep entry content concise and focused**
4. **Include relevant keywords** to improve search results
5. **Use numbered lists** for step-by-step instructions
6. **Organize entries** in a logical order within each module
7. **Test your modules** by searching for keywords to ensure they're discoverable
8. **Use fixed module IDs** for stability across application updates
9. **Version your modules** to track changes

## Example Modules

The application includes several example modules:

- `weapon-mods.ts`: Information about weapon modifications
- `armor-mods.ts`: Information about armor customization
- `settlement-mods.ts`: Information about settlement building
- `graphics-mods.ts`: Information about graphics enhancements

Study these examples to understand the module structure and content organization.

## Advanced Module Features

### Dependencies

You can specify module dependencies to ensure modules load in the correct order:

\`\`\`typescript
const module: ModuleDefinition = {
  // ... other properties
  dependencies: ["required-module-id"],
}
\`\`\`

### Module Versioning

Use semantic versioning (MAJOR.MINOR.PATCH) for your modules:

- Increment MAJOR version when making incompatible API changes
- Increment MINOR version when adding functionality in a backward-compatible manner
- Increment PATCH version when making backward-compatible bug fixes

## Troubleshooting

If your module isn't appearing in the knowledge base:

1. Check for JavaScript errors in the browser console
2. Verify that your module is properly imported and registered
3. Ensure your module ID is unique
4. Check that your module structure follows the required format

## Contributing Modules

If you've created a useful module, consider sharing it with the community by:

1. Creating a pull request to the main repository
2. Sharing it on Nexus Mods or other Fallout 4 modding communities
3. Documenting any special features or requirements
