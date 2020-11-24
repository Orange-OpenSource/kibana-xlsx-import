import './index.scss';

import { KibanaXlsxImportPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new KibanaXlsxImportPlugin();
}
export { KibanaXlsxImportPluginSetup, KibanaXlsxImportPluginStart } from './types';
