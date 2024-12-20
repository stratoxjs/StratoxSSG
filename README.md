# Stratox - Static Site Generator (SSG)

The Stratox Static Site Generator (SSG) is a lightweight tool that transforms your dynamic Stratox application into static HTML files. This approach enhances site performance, boosts SEO, and makes deployment a breeze.

---

## Features

- **Flexible Configuration**: Customize the build process with options for port, host, and SSL.
- **Dynamic to Static**: Generate static HTML files for specific routes.
- **SEO-Friendly**: Optimized output for better search engine visibility.

---

## Prerequisites

1. Ensure **Node.js** is installed on your system.
2. Install Stratox SSG via npm:
```bash
npm install @stratox/ssg --save-dev
```
---

## Usage Guide

### Step 1: Define Routes for Static Generation
Edit your `vite.config.js` file to specify the paths you want to generate as static HTML.

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  stratoxSSG: {
    paths: [
      '/',
      '/about',
      '/contact'
    ]
  }
});
```

---

### Step 2: Generate Static Files

Run the following commands to build your static files:

1. **Basic Build**:
   ```bash
   npx ssg build
   ```
   This command generates static files and outputs them to the `dist` directory.

2. **Custom Port**:
   To specify a custom port for the build script to access, use:
   ```bash
   npx ssg build --port 5193
   ```

3. **Custom Host**:
   To specify a custom host for the build script, use:
   ```bash
   npx ssg build --host example.test
   ```

4. **Enable HTTPS**:
   To use HTTPS for the build script, add the `--ssl` option:
   ```bash
   npx ssg build --ssl true
   ```

---

### Step 3: Deploy Your Static Site

After building your static files, deploy the contents of the `dist` directory to your preferred hosting platform (e.g., Netlify, Vercel, or your own server).

---

## Example Directory Structure

After running the `ssg build` command, your project directory might look like this:

```
project-root/
├── dist/
│   ├── assets/
│   ├── index.html
│   ├── about.html
│   └── contact.html
├── src/
├── vite.config.js
└── package.json
```

---

## Advanced Tips

- **Automated Builds**: Add the build command to your `package.json` scripts for easier execution:
  ```json
  "scripts": {
    "build:ssg": "ssg build"
  }
  ```
  Then run:
  ```bash
  npm run build:ssg
  ```
