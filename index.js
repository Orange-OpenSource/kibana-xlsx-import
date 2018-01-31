import { resolve } from 'path';
import serverRoute from './server/routes/routing';

export default function (kibana) {
  return new kibana.Plugin({

    require: ['elasticsearch'],
    name: 'xlsx-import',
    uiExports: {
      
      app: {
        title: 'XLSX Import',
        description: 'Import XLSX to JSON',
        main: 'plugins/xlsx-import/app',
        injectVars: function (server, options) {
          var config = server.config();
          return {
            kbnIndex: config.get('kibana.index'),
            esApiVersion: config.get('elasticsearch.apiVersion'),
          };
        }
      },
      
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    
    init(server, options) {
      // Add server routes and initialize the plugin here
      const adminCluster = server.plugins.elasticsearch.getCluster('admin');
      const dataCluster = server.plugins.elasticsearch.getCluster('data');

      serverRoute(server, adminCluster, dataCluster);
    }
    

  });
};
