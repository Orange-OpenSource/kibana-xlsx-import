import XLSX from 'xlsx';
import moment from 'moment-timezone';
import React from 'react';
import ReactDOM from 'react-dom';

//Recupère le header de la feuille excel
export function getHeaderRowWithType(sheet) {
    var headers = [];
    var range = XLSX.utils.decode_range(sheet['!ref']);
    

    var C
    let U = 1 
    var headerCell
    var firstValueCell

    const typesMapping = {
      "s": "text",
      "n": "float",
      "d": "date",
      "b": "boolean"
    }
    /* walk every column in the range */
    for(C = range.s.c; C <= range.e.c; ++C) {
      headerCell = sheet[XLSX.utils.encode_cell({c:C, r:0})] /* find the cell in the first row */
      firstValueCell = sheet[XLSX.utils.encode_cell({c:C, r:1})]

      if (headerCell || firstValueCell) {

        if (!headerCell || !XLSX.utils.format_cell(headerCell).trim())
        {
          headerCell = `UNKNOWN_${U}`
          U++
        }
        else {
          headerCell = formatHeader(XLSX.utils.format_cell(headerCell).trim())
        }

        headers.push({
          name: headerCell,
          type: typesMapping[(firstValueCell && firstValueCell.t) || 's']
        })
      }
      
    }
    return headers
}

//Replace all space in json data keys
export function formatJSON(json, columns, timezone = false){

  const dateColumns = columns.filter(c => (c.type === "date"))

  // Iterate over array
  json.forEach(function(e, i) {
  // Iterate over the keys of object
    Object.keys(e).forEach(function(key) {

      // Copy the value
      var val = e[key],
      newKey = key.replace(/\s+/g, '_');

      // check date object and manage timezone
      if (timezone && dateColumns.filter(c => (newKey === c.name)).length > 0) {
        val = moment(val).tz(timezone).format()
      }

      // Remove key-value from object
      delete json[i][key];

      // Add value with new key
      json[i][newKey] = val;
    });
  });
  return json;
}

//Transform filename to a valid ES index name
export function setESIndexName(name) {

  var name = name.split('.')[0];              //removing extension
  name = name.replace(/\s/g, '');             //removing space
  name = name.replace(/[^a-zA-Z0-9]/g, "");   //removing special characters
  name = name.toLowerCase();                  //lowercase
  return name;
}

//Replace all space in json header
function formatHeader(header){
  return header.replace(/ /g,"_");
}

export function getExtension(filename) {
  console.log("get extension treatment");
  return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}

//export default { getHeaderRowWithType, formatJSON, setESIndexName, getExtension }
