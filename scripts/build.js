import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'node',
  format: 'esm',
  packages: 'external',
  minify: true,
}).catch(() => process.exit(1));