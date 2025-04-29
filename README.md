# Mustang Survival

## Setup

1. Install the required dependencies using npm:

```bash
npm install
```

2. Run `npm run dev`

## Setup Theme TOML

1. Create a new file called `shopify.theme.toml` using `shopify.theme.example.toml` in the root directory of your project.
2. Copy the contents of the example `shopify.theme.toml` file provided by Shopify.
3. Replace the placeholder values in the `shopify.theme.toml` file with the appropriate values for your Shopify store:

- Replace `{{storeHandle}}` with your Shopify store name.
- Replace `{{themeAccessToken}}` with the theme access password obtained from the [Theme Access App](https://apps.shopify.com/theme-access) in your Shopify store.

4. Save the `shopify.theme.toml` file.
5. If you have more than one store per project, you might have more than one env in your toml file - be sure to update the `dev` commands in the `package.json` file as necessary.

## Development with VS Code

To develop with VS Code, follow these steps:

1. Open the project in VS Code.
2. In the sidebar, click on the "Run and Debug" icon (or press Ctrl+Shift+D).
3. In the top toolbar, click on the "Run" dropdown menu.
4. Select "Start Development".
5. Click on the green play button to start running your code.

## Attach Debugger to VS Code

To attach the debugger to VS Code and enable debugging in your TypeScript/JavaScript component files, follow these steps:

1. Start the development server by following the "Development with VS Code" steps mentioned above.
2. In the VS Code sidebar, click on the "Run and Debug" icon (or press Ctrl+Shift+D).
3. In the top toolbar, click on the "Run" dropdown menu.
4. Select "Open Chrome & Attach Debugger" and Click on the green play button.
5. A new Chrome Window Opens.
6. Add the `debugger` statement anywhere in your TypeScript/JavaScript component file where you want to set a breakpoint.
7. The debugger from VS Code will now be connected to your browser, allowing you to debug your code.

## Development with OS Terminal

To start the development server, run the following command: `npm run dev`

## Add New JS/TS File to be Built as Entry Point

To add a new JavaScript or TypeScript file to be built as an entry point, follow these steps:

1. Navigate to the `src/entry` directory.
2. Create a new file with a `.ts` or `.js` extension.
3. Inside the new file, extend the `BaseElement` class located in `src/base/`. This will allow you to reuse global CSS styles and Tailwind CSS classes.
4. Save the file.

The new file will be treated as a file that will be compiled to JavaScript and bundled inside the assets folder of the theme.

## Differences between `/entry` and `/entry/core`

All files inside `src/entry` (including subfolders) will be bundled into JavaScript assets that can be called within Shopify Liquid templates. However, there is an important organizational distinction between the main `entry` folder and its `core` subfolder:

- `/entry/core/`:
  - Contains components that are part of the core system.
  - If you need to modify a core component, consider **extending** or **patching** it in your own custom file instead of editing it in-place.
- `/entry/` (outside the core folder):
  - This is the generic place for your custom files and components that you want compiled into individual `.js` files in the `assets` folder.
  - Feel free to create, modify, and maintain your own components here

In short:

- Anything inside /entry will be compiled into the theme’s assets.
- /entry/core is primarily for core code—treat it as read-only unless you are certain you need to override or extend a core function.

## Carousels

Carousels are built using swiper.js . More context is available in `src/base/SwiperElement.ts`, but you can extend the internal Swiper component to add more functionality/options as necessary. Keeping `overflow-clip` and `whitespace-nowrap` on the container element can help reduce layout shift in the carousel while the browser waits for swiperjs to load.

## Inline Styles for LitComponent and using Tailwind Inside them

We can leverage Vite CSS Inlining and use TW inside Lit Component in special cases where we are leveraging the styles property of the LitElements.

To add styles to a LitElement, create a new .css file in the src/styles folder (e.g., component-only-css.css) and add styles for the file. You can leverage Tailwind CSS functions like @apply, @layer, @screen to make use of Tailwind CSS utilities.

Import the CSS file to the LitComponent file using the following format: `import styles from '/path/to/css/file.css?inline'`. The `styles` variable will be hydrated by Vite with the compiled CSS string, and this can be simply assigned to the LitElement's `styles` property.

Here is an example code snippet for the LitElement with inlined styles using Tailwind CSS:

example.css

```
.component {
  @apply block bg-brand-primary;
}

:host {
  @apply relative block;
}
```

example-component.ts

```
// @ts-ignore
import styles from './styles/examples.css?inline'

class ExampleComponent extends BaseElement {
  static styles = [unsafeCSS(styles)]
}
```

## Working with Fonts and Tailwind

- If your custom font names differ from those in your design manifest, you can override these variables in your CSS. For example, if your design uses a different primary font, you can set the variable like this:

```
:root {
  --font-family-primary: 'Poppins';
  --font-family-secondary: 'Poppins';
  --font-family-tertiary: 'Poppins';
  --font-family-quaternary: 'Poppins';
}

```

This will ensure that all primary text elements use 'Poppins' instead of the default from design.manifest.json

### Debugging Tailwind

Tailwind uses the Standard node debugger with namespace, `tailwind*`, so debug logs can be viewed by updating the `theme:assets` task with `export DEBUG='tailwind*' && npm run dev`. This will expose deep logging from the plugin.

## Design System

You can find the Project Demo built using the `styleguide.liquid` layout, by creating a new page on shopify admin using page template provided with name `page.styleguide.json` that internally uses `component-styleguide.liquid` section.

## Deployments

### Setting up the deployments

You can automate the deployment process of your project using GitHub Actions and ensure a smooth release to your Shopify store(s).
To setup deployments for your project using GitHub Actions, follow these steps:

1. Create a new environment on your GitHub repository, such as "Dev".

2. Set up an environment variable named `SHOPIFY_FLAG_STORE` with the URL of your Shopify store (e.g., `https://yourstore.myshopify.com`).

3. Generate a Shopify CLI theme token using the Theme Access app installed on your store.

4. Set up an environment secret named `SHOPIFY_CLI_THEME_TOKEN` and paste the generated theme token as the value.

### Running a deployment

Use the `deploy.yml` GitHub Actions workflow file for deploying to a single store, or use the `deployAll.yml` workflow file for deploying to multiple stores.

To start a new deployment use the following steps:

1. Go to Github repo > **Actions**
2. On left sidebar choose the correct deployment workflow. This will either be **Deploy v3** or **Deploy to Multi Environment**.
3. Click on the **Run Workflow** button and a popup will open
4. Choose the branch you want to deploy from and the store environment you want to deploy too
5. Optionally, specify a theme ID in the **Theme Override** field if you want to deploy to an existing (non live) theme, otherwise the live theme will be duplicated and this newly duplicated theme will be used to deploy too
6. Optionally, select whether to publish this new theme as part of the deployment process or not
7. Click the **Run workflow** button to start the deployment

### Syncing JSON files during deployments

By default JSON locale and template files are not pushed from the repo when deploying. These JSON files are ignored via the `.shopifyignore` file. This is to prevent the production theme's config and content from being overwritten.

This means that we manually add any new locale strings or JSON templates to the theme we are deploying to. However when deploying we also want to ensure we sync any changes from production that may have been made since our deployment theme was created.

To help with this, as part of the deployment workflow there is a `shopify-jsons-sync` action step which handles the syncing of the production JSON.

This action works by:

- Pulling all of the JSON files from the currently pushlished theme as a starting point
- For the JSON locale files it will merge any new strings it detects from the deployment theme and keep all of the existing strings unmodified
- For any newly added template JSON files it finds in the deployment theme, it will add these files
- For any template files that exist in both the published theme and the deployment theme, only the published themes version will be kept
- All these JSON files will then be pushed to the deployment theme

## Working with a Windows Computer ?

We leverage `npx`, for running Shopify CLI, that is not fully compatible with windows machines as a work around to start development we need to use multiple shells

1. On the first shell run command `npm run theme:assets`;

2. On the second shell run command `npm run theme:shopify:initial-push-w; npm run theme:shopify;`

# Customizing Swiper with Injected CSS

The Swiper Web Component (`SwiperElement`) supports injecting custom CSS via the `injectStyles` option provided by its SDK. This feature allows you to customize Swiper's appearance while maintaining a clean and modular setup.

## Leveraging Tailwind CSS and Vite's Inline Features

By combining Vite's inline CSS feature with Tailwind CSS, you can seamlessly reuse design tokens defined in your Design Manifest. This approach lets you incorporate the full power of Tailwind utilities while dynamically compiling a CSS string to be injected into Swiper.

## Implementation

### Step 1: Create a CSS File

Define your custom styles in a CSS file. You can use Tailwind’s utility classes directly with the `@apply` directive to keep styles consistent.

```css
/* File: src/styles/component-dialog.css */

.some-selector {
  @apply bg-t-primary inline-flex; /* Add other Tailwind utilities as needed */
}
```

### Step 2: Import and Inject Styles

Use the `?inline` query in Vite to import the CSS as a string. Then inject it into your Swiper instance using the `injectStyles` option.

```typescript
/* File: component-custom-swiper.ts */
// @ts-ignore: Importing inline CSS
import styles from '@/styles/component-dialog.css?inline'

export class SampleSwiper extends SwiperElement {
  swiperOptions = {
    injectStyles: [styles], // Inject the custom styles
    /* Add other Swiper options as needed */
  }
}
```

### Metadata

- Metaobjects are used to define color swatches
- Product badges are defined on the product level and reference metaobjects
