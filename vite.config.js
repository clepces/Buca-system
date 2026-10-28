import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    root: './',
    resolve: {
        alias: [
            {
                find: '@',
                replacement: path.resolve(__dirname, 'src')
            }
        ]
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                silenceDeprecations: ['global-builtin', 'color-functions', 'import']
            }
        }
    },
    server: {
        host: true,
        port: 3002,
        strictPort: true,
        cors: true
    },
    build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('firebase')) return 'vendor-firebase';
                        if (id.includes('bootstrap')) return 'vendor-bootstrap';
                        return 'vendor';
                    }
                }
            }
        }
    }
});
