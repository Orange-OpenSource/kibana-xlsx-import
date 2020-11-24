//import { nanoid } from 'nanoid';

export function broofa() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}
export function createBulk(json, indexName, kbnCustomId = '', BULKSIZE = 1000) {
  var bulk_request = [];
  var bulk_package = [];

  let line = 2 // +2 == (header line + begin from 1 not from 0)

  for(var i = 0; i < json.length; i++) {

    const keys = {
      // all columns name are usable to create custom document id 
      ...json[i],
      // or special reserved variable
      "_line": line,
      "_uid": broofa()
      //"_uid": 10000000
    }

    bulk_package.push({index: { 
      _index: indexName, 
      ...(kbnCustomId !== '' && { _id: createKbnCustomId(kbnCustomId, keys) }) 
    } });

    bulk_package.push(json[i]);

    if(bulk_package.length >= BULKSIZE) {
      bulk_request.push(bulk_package);
      bulk_package = [];
      if(json[i+1] === undefined)
        return bulk_request;
    }

    line++
  }
  bulk_request.push(bulk_package);

  return bulk_request;
}

export function getUID() {
  return broofa()
}

export function createKbnCustomId(template, obj) {
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

export default { createBulk, createKbnCustomId, getUID }
