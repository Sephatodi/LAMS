import { readFileSync } from 'fs';

export default function arcgisPlugin() {
  return {
    name: 'arcgis-plugin',
    transform(code, id) {
      if (/@arcgis[/\\]core[/\\].*\.js$/.test(id)) {
        return {
          code: code.replace(/\.\/assets/g, '@arcgis/core/assets'),
          map: null
        };
      }
    },
    resolveId(source) {
      if (source.startsWith('@arcgis/core/')) {
        return { id: source, external: true };
      }
      return null;
    }
  };
}