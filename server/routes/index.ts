//import { schema } from '@kbn/config-schema';
import { IRouter } from '../../../../src/core/server';

export function defineRoutes(router: IRouter) {
  router.get(
    {
      path: '/api/kibana_xlsx_import/example',
      validate: false,
    },
    async (context, request, response) => {
      return response.ok({
        body: {
          time: new Date().toISOString(),
        },
      });
    }
  );
  router.get(
    {
      path: '/api/kibana_xlsx_import/cluster/_health',
      validate: false,
    },
    async (context, request, response) => {
      const data = await context.core.elasticsearch.legacy.client.callAsInternalUser('cluster.health')     
      console.log('****************** ', data)
      return response.ok({
        body: {
          time: Object.keys(data.status)
          // time: new Date().toISOString(),
        },
      });
    }
  ); 
  router.get(
    {
      path: '/api/kibana_xlsx_import/cat/indices',
      validate: false,
    },
    async (context, request, response) => {
      const data = await context.core.elasticsearch.legacy.client.callAsInternalUser('cat.indices')     
      console.log('****************** ', data)
      return response.ok({
        body: {
          //ime: Object.keys(data.status)
          // time: new Date().toISOString(),
        },
      });
    }
  ); 
  
  router.post(
    {
      path: '/api/kibana_xlsx_import/create/indice/{index}',
      validate: false,      
    },
    
    async (context, request, response) => {
      console.log('******************  create indice',request);
      console.log((request.url.pathname)?.lastIndexOf('/'));
      const indexName  =request.url.pathname?.substring((request.url.pathname)?.lastIndexOf('/') + 1);
      console.log(indexName);
      console.log('******************  create indice',request.route.options.body);
      const data = await context.core.elasticsearch.legacy.client.callAsInternalUser('indices.create',{'index':indexName})     
      console.log('****************** ', data)
      return response.ok({
        body: {
          //ime: Object.keys(data.status)
          // time: new Date().toISOString(),
        },
      });
    }
  ); 


/*  	//GET cluster health
    router.get({
      path: '/api/kibana-xlsx-import/health',
      validate: false
    },
    async (context, request, response) => {
      const data = await context.core.elasticsearch.legacy.client.callAsInternalUser('cluster.health',['post'])
      
      
      console.log('****************** ', data)
      return response.ok({
        body: {
          time: Object.keys(data.metadata.indices)
          // time: new Date().toISOString(),
        },
      });
    }
    );

    //Perform BULK for creating / adding multiple documents to an index
    router.get({
      path: '/api/kibana-xlsx-import/{index}/_bulk',
      validate: false,
      
      method: 'POST'
    },
    async (context, request, response) => {
        	try {
                const pipeline = request.query.pipeline || false;
                const response = await dataCluster.callWithRequest(req, 'bulk', {
                    ...(pipeline && { pipeline }),
                    body: request.payload
                })
                return response;
            } catch(e) {
                console.error(e);
                return {"error": e};
            }
        }
    });

    //Create a mapping for a selected index
    server.route({
        path: '/api/kibana-xlsx-import/{index}/_mapping',
        method: 'POST',
        async handler(req, h) {
            try {
                return (await dataCluster.callWithRequest(req, 'indices.putMapping', {
                    index: req.params.index,
                    body: {
                        properties: req.payload
                    }
                }))
            } catch(e) {
                console.error(e);
                return {"error": e};
            }
        }
    });

    //creating index
    server.route({
        path: '/api/kibana-xlsx-import/{index}',
        method: 'POST',
        async handler(req, h) {
            try {
                const response = await dataCluster.callWithRequest(req, 'indices.create', {
                    index: req.params.index,
                    body: req.payload
                })
                return response;
            } catch(e) {
                console.error(e);
                return {"error": e};
            }
        }
    });

    //checking index
    server.route({
        path: '/api/kibana-xlsx-import/{index}/_exists',
        method: 'GET',
        async handler(req, h) {
            try {
                const {err, response} = await dataCluster.callWithRequest(req, 'indices.get', {
                    index: req.params.index,
                    body: req.payload,
                    ignore: [404]
                })
                if (err) {
                    return err;
                }
                return response;
            } catch(e) {
                console.error(e);
                return {"error": e};
            }
        }
    });

    //creating index
    server.route({
        path: '/api/kibana-xlsx-import/{index}',
        method: 'DELETE',
        async handler(req, h) {
            try {
                const response = await dataCluster.callWithRequest(req, 'indices.delete', {
                    index: req.params.index,
                    body: req.payload
                })
                return response;
            } catch(e) {
                console.error(e);
                return {"error": e};
            }
        }
    });*/
}
