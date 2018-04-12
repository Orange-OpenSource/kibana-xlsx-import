export default function (server, adminCluster, dataCluster) {

	//GET cluster health
    server.route({
    	path: '/api/xlsx_import/health',
        method: 'GET',
        handler(req, reply) {
        	dataCluster.callWithRequest(req, 'cluster.health')
        	.then(function (response) {
        		reply(response);
    		});
    	}
    });

	//Perform single POST for creating / adding document to an index
    server.route({
    	path: '/api/xlsx_import/{index}/{document}',
        method: 'POST',
        handler(req, reply) {
        	dataCluster.callWithRequest(req, 'index', {
        		index: req.params.index,
        		type: req.params.document,
        		body: req.payload
        	})
        	.then(function (err, response) {
        		if(err)
        			reply(err);
        		else
        			reply(response);
    		});
    	}
    });

    //Perform BULK for creating / adding multiple documents to an index
    server.route({
    	path: '/api/xlsx_import/{index}/{document}/_bulk',
        method: 'POST',
        handler(req, reply) {

        	dataCluster.callWithRequest(req, 'bulk', {
        		body: req.payload
        	})
        	.then(function (err, response) {
        		if(err)
        			reply(err);
        		else
        			reply(response);
    		});
    	}
    });

    //Create a mapping for a selected index and document
    server.route({
        path: '/api/xlsx_import/{index}/_mapping/{document}',
        method: 'POST',
        handler(req, reply) {
            dataCluster.callWithRequest(req, 'indices.putMapping', {
                index: req.params.index,
                type: req.params.document,
                body: req.payload,
            })
            .then((response) => {
                reply(response);

            }).catch((e) => {
                console.error(e);
                reply({"error" : e})
            });
        }
    });

    //creating index
    server.route({
        path: '/api/xlsx_import/{index}',
        method: 'POST',
        handler(req, reply) {
            dataCluster.callWithRequest(req, 'indices.create', {
                index: req.params.index,
                body: req.payload
            })
            .then((response) => {
                reply(response);

            }).catch((e) => {
                console.error(e);
                reply({"error" : e})
            });
        }
    });

    //checking index
    server.route({
        path: '/api/xlsx_import/{index}/_exists',
        method: 'GET',
        handler(req, reply) {
            dataCluster.callWithRequest(req, 'indices.get', {
                index: req.params.index,
                body: req.payload,
                ignore: [404]
            })
            .then(function (err, response) {
                if(err)
                    reply(err);
                else
                    reply(response);
            });
        }
    });
}
