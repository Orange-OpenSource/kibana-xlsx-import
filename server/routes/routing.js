export default function (server, adminCluster, dataCluster) {

	//GET cluster health
    server.route({
    	path: '/api/kibana-xlsx-import/health',
        method: 'GET',
        async handler(req, h) {
            try {
            	const response = await dataCluster.callWithRequest(req, 'cluster.health');
                return response;
            } catch (e) {
                console.error(e);
                return {"error": e};
            }
        }
    });

	//Perform single POST for creating / adding document to an index
    server.route({
    	path: '/api/kibana-xlsx-import/{index}/{document}',
        method: 'POST',
        async handler(req, h) {
            try {
            	const {err, response} = await dataCluster.callWithRequest(req, 'index', {
            		index: req.params.index,
            		type: req.params.document,
            		body: req.payload
            	})
                if (err) {
                    return err;
                }
                return response;
            } catch (e) {
                console.error(e);
                return {"error": e};
            }
        }
    });

    //Perform BULK for creating / adding multiple documents to an index
    server.route({
    	path: '/api/kibana-xlsx-import/{index}/{document}/_bulk',
        method: 'POST',
        async handler(req, h) {
        	try {
                const response = await dataCluster.callWithRequest(req, 'bulk', {
                    body: req.payload
                })
                return response;
            } catch(e) {
                console.error(e);
                return {"error": e};
            }
        }
    });

    //Create a mapping for a selected index and document
    server.route({
        path: '/api/kibana-xlsx-import/{index}/_mapping/{document}',
        method: 'POST',
        async handler(req, h) {
            try {
                const response = await dataCluster.callWithRequest(req, 'indices.putMapping', {
                    index: req.params.index,
                    type: req.params.document,
                    body: req.payload,
                })
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
    });
}
