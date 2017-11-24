
import exampleRoute from './server/routes/example';

export default function (kibana) {
  return new kibana.Plugin({

    require: ['elasticsearch'],
    name: 'xlxs-import',
    uiExports: {
      
      app: {
        title: 'Data XLXS Import',
        description: 'Import XLXS to JSON',
        main: 'plugins/xlxs-import/app'
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

      exampleRoute(server, adminCluster, dataCluster);
    }
    

  });
};
