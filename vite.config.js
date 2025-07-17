import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import nodeResolve from '@rollup/plugin-node-resolve';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import rollupNodePolyfills from 'rollup-plugin-node-polyfills';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import arcgisPlugin from './arcgis-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        jsxRuntime: 'automatic'
      }),
      eslint({
        cache: false,
        fix: true,
        include: ['src/**/*.{js,jsx,ts,tsx}'],
        exclude: ['**/public/assets/**', '**/node_modules/**', '**/dist/**'],
        failOnWarning: isProduction,
        failOnError: isProduction
      }),
      arcgisPlugin(),
      svgr({
        svgrOptions: {
          icon: true,
          svgo: true,
          svgoConfig: {
            plugins: [{
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false
                }
              }
            }]
          }
        }
      }),
      isProduction && visualizer({
        filename: './dist/bundle-stats.html',
        gzipSize: true,
        brotliSize: true
      }),
      isProduction && legacy({
        targets: ['defaults', 'not IE 11'],
        modernPolyfills: true
      })
    ].filter(Boolean),

    define: {
      __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE || 'LAMS'),
      'process.env': JSON.stringify(env),
      global: 'globalThis'
    },

    optimizeDeps: {
      exclude: ['fs', 'fabric-network', '@arcgis/core', 'leaflet-draw'],
      include: [
        'react',
        'react-dom',
        '@mui/material',
        'leaflet/dist/leaflet.css',
        '@mui/icons-material',
        'react-router-dom',
        'react-leaflet',
        'leaflet/dist/leaflet.css'
      ],
      esbuildOptions: {

        jsx: 'transform', // Ensure proper JSX transformation
        legalComments: 'none',
        define: {
          global: 'globalThis'
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true
          }),
          NodeModulesPolyfillPlugin()
        ],
        target: 'es2020'
      }
    },

    build: {
      minify: isProduction ? 'terser' : false,
      chunkSizeWarningLimit: 3000,
      sourcemap: !isProduction,
      rollupOptions: {
         treeshake: false,
        plugins: [
          nodeResolve({
            browser: true,
            preferBuiltins: false
          }),
          rollupNodePolyfills()
        ],
        external: [
          /^@arcgis\/core\/.*/,
          'fs',
          'vm',
          'asn1.js',
          'path',
          'fabric-network'
        ],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@arcgis')) return 'arcgis';
              if (id.includes('@mui')) return 'mui';
              if (id.includes('react')) return 'react-vendor';
              if (id.includes('leaflet')) return 'leaflet';
              if (id.includes('formik')) return 'forms';
              return 'vendor';
            }
          },
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          }
        },
        onwarn(warning, warn) {
          if (warning.code === 'CIRCULAR_DEPENDENCY') return;
          warn(warning);
        }
      }
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@component': path.resolve(__dirname, './src/component'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@arcgis/core': path.resolve(__dirname, 'node_modules/@arcgis/core/assets'),
        '@arcgis/core/assets': '@arcgis/core/assets/index.js',
        'node-fetch': 'isomorphic-fetch',
        'crypto': 'crypto-browserify',
        'path': 'path-browserify',
        'events': 'events-browserify',
        'process': 'process/browser',
        'stream': 'rollup-plugin-node-polyfills/polyfills/stream',
        'util': 'rollup-plugin-node-polyfills/polyfills/util'
      }
    },

    server: {
      port: 3000,
      strictPort: true,
      open: !process.env.CI,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, '')
        }
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    },

    preview: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});