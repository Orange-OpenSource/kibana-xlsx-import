import XLSX from 'xlsx';

//Recupère le header de la feuille excel
function get_header_row(sheet) {
    var headers = [];
    var range = XLSX.utils.decode_range(sheet['!ref']);
    var C, R = range.s.r; /* start in the first row */
    /* walk every column in the range */
    for(C = range.s.c; C <= range.e.c; ++C) {
        var cell = sheet[XLSX.utils.encode_cell({c:C, r:R})] /* find the cell in the first row */

        var hdr = "UNKNOWN " + C; // <-- replace with your desired default
        if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);

        headers.push(formatHeader(hdr));
    }
    return headers;
}

//Replace all space in json data keys
function formatJSON(json){
  // Iterate over array
  json.forEach(function(e, i) {
  // Iterate over the keys of object
    Object.keys(e).forEach(function(key) {

    // Copy the value
      var val = e[key],
      newKey = key.replace(/\s+/g, '_');

    // Remove key-value from object
      delete json[i][key];

    // Add value with new key
      json[i][newKey] = val;
    });
  });
  return json;
}

//Formate le nom du fichier pour le transformer en nom d'index ES correct
function setESIndexName(name) {

  var name = name.split('.')[0];              //removing extension
  name = name.replace(/\s/g, '');             //removing space
  name = name.replace(/[^a-zA-Z ]/g, "");     //removing special characters
  name = name.toLowerCase();                  //lowercase
  return name;
}

//Replace all space in json header
function formatHeader(header){
  return header.replace(/ /g,"_");
}

function getExtension(filename) {
  return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}

export default { get_header_row, formatJSON, setESIndexName, getExtension }
