import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface KibanaXlsxImportPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface KibanaXlsxImportPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
