function createBulk(json, indexName, kbnCustomId) {
  var bulk_request = [];
  var bulk_package = [];

  for(var i = 0; i < json.length; i++) {

    if(kbnCustomId != '')
      bulk_package.push({index: { _index: indexName, _type: 'doc', _id: createKbnCustomId(kbnCustomId, json[i]) } });
    else
      bulk_package.push({index: { _index: indexName, _type: 'doc' } });
    bulk_package.push(json[i]);

    if(bulk_package.length >= 1000) {   //TODO : Get this number from config
      bulk_request.push(bulk_package);
      bulk_package = [];
      if(json[i+1] === undefined)
        return bulk_request;
    }
  }
  bulk_request.push(bulk_package);

  return bulk_request;
}


function createMapping(elements, advjsons, items) {
  var types = [];
  var mappingParameters = [];

  for(var i=0; i < elements.length; i++){
    types.push(elements[i].value);
  }

  for(var j=0; j < advjsons.length; j++){
    mappingParameters.push(advjsons[j].value);
  }

  console.log(mappingParameters)

  var mapping_request = '{ "properties": {';

  for(var i = 0; i < elements.length; i++) {

    /*if(types[i] === 'text')
      mapping_request += '"'+ items[i] +'": { "type": "'+ types[i] +'", "fields": { "keyword": { "type": "keyword" } } }';
    else
      mapping_request += '"'+ items[i] +'": { "type": "'+ types[i] +'" }';*/

    if(mappingParameters[i] != undefined && mappingParameters[i] != "")
      mapping_request += '"'+ items[i] +'": { "type": "'+ types[i] +'", '+ mappingParameters[i] +' }';
    else {
      mapping_request += '"'+ items[i] +'": { "type": "'+ types[i] +'" }';
    }

    if(i < elements.length -1)
      mapping_request += ','
    }

    mapping_request += '} }';

    return mapping_request;
}

function createKbnCustomId(template, obj) {
  var getFromBetween = {
    results:[],
    string:"",
    getFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var SP = this.string.indexOf(sub1)+sub1.length;
        var string1 = this.string.substr(0,SP);
        var string2 = this.string.substr(SP);
        var TP = string1.length + string2.indexOf(sub2);
        return this.string.substring(SP,TP);
    },
    removeFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
        this.string = this.string.replace(removal,"");
    },
    getAllResults:function (sub1,sub2) {
        // first check to see if we do have both substrings
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

        // find one result
        var result = this.getFromBetween(sub1,sub2);
        // push it to the results array
        this.results.push(result);
        // remove the most recently found one from the string
        this.removeFromBetween(sub1,sub2);

        // if there's more substrings
        if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
            this.getAllResults(sub1,sub2);
        }
        else return;
    },
    get:function (string,sub1,sub2) {
        this.results = [];
        this.string = string;
        this.getAllResults(sub1,sub2);
        return this.results;
    }
  };
  let keys = getFromBetween.get(template, "{", "}");

  keys.forEach(function(key) {
    if(obj[key] != undefined)
      template = template.replace('{'+key+'}', obj[key]);
    else
      template = template.replace('{'+key+'}', key);
  })

  return template;
}

export default { createBulk, createMapping, createKbnCustomId }
