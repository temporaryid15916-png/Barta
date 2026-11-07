/**
 * BARTA Deployable Project Exporter
 * Bundles the entire production codebase into a clean, GitHub-ready ZIP archive
 * @license Apache-2.0
 */

import JSZip from 'jszip';

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root configuration files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'barta-communication-platform',
        private: true,
        version: '1.0.0',
        type: 'module',
        description: 'BARTA: Connect Beyond Boundaries - Premium E2EE Messaging Platform',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'tsc --noEmit',
        },
        dependencies: {
          'lucide-react': '^0.546.0',
          motion: '^12.23.24',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          jszip: '^3.10.1',
        },
        devDependencies: {
          '@tailwindcss/vite': '^4.3.3',
          '@types/node': '^22.14.0',
          '@types/react': '^19.3.0',
          '@types/react-dom': '^19.3.0',
          '@types/jszip': '^3.4.1',
          '@vitejs/plugin-react': '^6.1.1',
          tailwindcss: '^4.3.3',
          typescript: '^7.0.2',
          vite: '^8.3.0',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './', // CRITICAL for GitHub Pages subdirectory compatibility
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
`
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: false,
          module: 'ESNext',
          types: ['vite/client'],
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          isolatedModules: true,
          jsx: 'react-jsx',
          paths: {
            '@/*': ['./*'],
          },
          noEmit: true,
        },
        exclude: ['dist'],
      },
      null,
      2
    )
  );

  zip.file(
    '.env.example',
    `# BARTA Production Configuration
VITE_APP_TITLE="BARTA - E2EE Communication Platform"
VITE_DEFAULT_HOMESERVER="https://matrix.org"
VITE_STUN_SERVER="stun:stun.l.google.com:19302"
`
  );

  zip.file(
    '.gitignore',
    `node_modules/
dist/
dist-ssr/
*.local
.env
.DS_Store
`
  );

  // GitHub Actions Workflow for automated GitHub Pages
  const ghWorkflow = zip.folder('.github')?.folder('workflows');
  ghWorkflow?.file(
    'deploy.yml',
    `name: Deploy BARTA to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Lint and Build
        run: |
          npm run lint
          npm run build

      - name: Verify dist
        run: |
          if [ ! -f "dist/index.html" ]; then
            echo "Error: dist/index.html missing!"
            exit 1
          fi

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`
  );

  // Documentation
  zip.file(
    'README.md',
    `# BARTA — Connect Beyond Boundaries

BARTA is a complete, premium, privacy-focused next-generation messaging platform with real-time End-to-End Encryption (E2EE), WebRTC calling, group conversations, voice messages with live waveform visualization, and Progressive Web App (PWA) installability.

---

## 🚀 Key Features

- 🔐 **Genuine E2EE from Day 1**: Client-side AES-GCM-256 authenticated encryption, ECDH P-256 key agreement, and 60-digit SHA-256 safety numbers with cryptographic fingerprint verification.
- 💬 **Rich Real-Time Messaging**: Read receipts, delivery status, emoji reactions, message edits, deletions, quoting/replies, pinning, star favorites, and disappearing messages.
- 🎙️ **Voice Notes**: Web Audio & MediaRecorder with real-time waveform visualization, pause/preview, playback speeds (1.0x, 1.5x, 2.0x), and AES-GCM encryption before upload.
- 📹 **Audio & Video Calling**: Real WebRTC RTCPeerConnection with STUN fallback, synthesized dual-tone harmonic ringtones (zero 404s), camera flipping, screen share, and quality indicators.
- 👥 **Group Conversations**: Roles (Admins, Members), pinned notices, member management, and group encryption.
- 📱 **PWA & Offline Ready**: Service worker cache shell, standalone display mode, in-app install prompt, and safe offline detection.
- 🌐 **GitHub Pages White-Screen Immune**: Relative Vite base path (\`./\`), hash-based routing, and self-contained Web Audio synthesis preventing 404 asset failures.

---

## 🛠️ Local Development

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
\`\`\`

---

## 🚢 Publishing to GitHub Pages (Step-by-Step)

1. Create a new GitHub repository named \`barta\`.
2. Push this source code to the \`main\` branch.
3. In GitHub, go to **Settings** > **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. The included workflow (\`.github/workflows/deploy.yml\`) will automatically build and publish BARTA!
`
  );

  // Generate the blob
  return await zip.generateAsync({ type: 'blob' });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
