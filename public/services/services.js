function createBulk(json, indexName) {
  var bulk_request = [];
  var bulk_package = [];

  for(var i = 0; i < json.length; i++) {

    bulk_package.push({index: { _index: indexName, _type: 'doc' } });
    bulk_package.push(json[i]);

    if(bulk_package.length >= 1000) {   //TODO : Get this number from config
      bulk_request.push(bulk_package);
      bulk_package = [];
    }
  }
  bulk_request.push(bulk_package);

  return bulk_request;
}

function createMapping(elements, items) {
  var types = [];

  for(var i=0; i < elements.length; i++){
    types.push(elements[i].value);
  }

  var mapping_request = '{ "properties": {';

  for(var i = 0; i < elements.length; i++) {

    if(types[i] === 'text')
      mapping_request += '"'+ items[i] +'": { "type": "'+ types[i] +'", "fields": { "keyword": { "type": "keyword" } } }';
    else
      mapping_request += '"'+ items[i] +'": { "type": "'+ types[i] +'" }';

    if(i < elements.length -1)
      mapping_request += ','
    }

    mapping_request += '} }';

    return mapping_request;
}

export default { createBulk, createMapping }
