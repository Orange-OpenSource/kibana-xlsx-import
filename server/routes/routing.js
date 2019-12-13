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

    //Perform BULK for creating / adding multiple documents to an index
    server.route({
    	path: '/api/kibana-xlsx-import/{index}/_bulk',
        method: 'POST',
        async handler(req, h) {
        	try {
                const pipeline = req.query.pipeline || false;
                const response = await dataCluster.callWithRequest(req, 'bulk', {
                    ...(pipeline && { pipeline }),
                    body: req.payload
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
    });
}
