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

      uiSettingDefaults: {
        'xlsx-import:bulk_package_size': {
          value: 1000,
          description: 'The number of json item send in one bulk request'
        },
        'xlsx-import:displayed_elements': {
          value: 5,
          description: 'Number of elements displayed in the preview datatable'
        },
        'xlsx-import:filesize_warning': {
          value: 10,
          description: 'Trigger for warning file size popup (in Mb)'
        },
        'xlsx-import:default_language': {
          value: "Browser",
          description: "Which language should be used.  \"Browser\" will use the language detected by your browser.",
          options: ["Browser", "English", "Français"],
          type: "select"
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
