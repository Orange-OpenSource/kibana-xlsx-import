import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { KibanaXlsxImportPluginSetup, KibanaXlsxImportPluginStart } from './types';
import { defineRoutes } from './routes';
import { Server } from 'http';

export class KibanaXlsxImportPlugin
  implements Plugin<KibanaXlsxImportPluginSetup, KibanaXlsxImportPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('kibana-xlsx-import: Setup');
    const router = core.http.createRouter();
    // Register server side APIs
    defineRoutes(router);
    
    return {};
  }

  public start(core: CoreStart) {
    
    this.logger.debug('kibana-xlsx-import: Started');
    return {};
  }

  public stop() {}
}
