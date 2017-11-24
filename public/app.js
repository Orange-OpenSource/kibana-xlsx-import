import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'ui/autoload/styles';
import './less/main.less';
import template from './templates/index.html';

let jsonData;
const maxFileSize = 4;
const bulkSize = 3000;

var app = uiModules.get('app/xlxs_import', []);

uiRoutes.enable();
uiRoutes
.when('/', {
  template : template
});


app.controller('xlxsImport', function ($scope, $route, $interval, $http) {
  $scope.title = 'Xlxs Import';
  $scope.description = 'Import XLXS to JSON';

  $scope.transfer = function() {

      var bulk = create_bulk(jsonData);
      bulk.forEach(function(split_bulk){
        $http.post('../api/xlxs_import/xlxs/doc/_bulk', split_bulk)
        .then((response) => {
          console.log(response);
        });
      })  
  }

});


app.directive('importSheetJs', function() {
  return {
    scope: { opts: '=' },
    link: function ($scope, $elm, $attrs) {
      $elm.on('change', function (changeEvent) {

        var reader = new FileReader();

        reader.onload = function (e) {
          
          if (typeof FileReader !== "undefined") {

            var size = (changeEvent.target.files[0].size)/1000000;
            var message = "Votre fichier depasse la taille limite, voulez vous continuer ?";

            //Warning si file.size > maxFileSize (TBD)
            if(size > maxFileSize) {

              if(confirm(message)) {
                convert_data(reader, "l'affichage est limité à 10 resultats");
              }
              else {
                return;
              }

            }
            else {
              convert_data(reader, "");
            }
          }
        }; 
        reader.readAsBinaryString(changeEvent.target.files[0]);
      });
    }
  };
});



//Traitement du fichier XLSX -> JSON
function convert_data(reader, message) {
  var fileData = reader.result;

  var wb = XLSX.read(fileData, {type : 'binary'});

  wb.SheetNames.forEach(function(sheetName){
    update_sheet_range(wb.Sheets[sheetName]);
    jsonData = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

    if(message)
      document.getElementById("warn_message").innerHTML = '<pre style="background-color:rgba(255, 0, 0, 0.4);">' + message + '</pre>';

    document.getElementById("json_container").innerHTML = '<pre>'+ angular.toJson(jsonData.slice(0,10), 2) +'</pre>';

  })
}

//Mise à jour du fichier en cas d'ouverture avec d'autres logiciel... (libreoffice)
function update_sheet_range(ws) {
  var range = {s:{r:20000000, c:20000000},e:{r:0,c:0}};
  Object.keys(ws).filter(function(x) { return x.charAt(0) != "!"; }).map(XLSX.utils.decode_cell).forEach(function(x) {
    range.s.c = Math.min(range.s.c, x.c); range.s.r = Math.min(range.s.r, x.r);
    range.e.c = Math.max(range.e.c, x.c); range.e.r = Math.max(range.e.r, x.r);
  });
  ws['!ref'] = XLSX.utils.encode_range(range);
}

//Permet de rendre compatible les données JSON avec le format bulk de ES
function create_bulk(json) {
  var bulk_request = [];
  var bulk_package = [];

  for(var i = 0; i < json.length; i++) {
    bulk_package.push({index: { _index: 'xlxs', _type: 'doc' } });
    bulk_package.push(json[i]);

    if(bulk_package.length >= bulkSize) {
      bulk_request.push(bulk_package);
      bulk_package = [];
    }
  }
  bulk_request.push(bulk_package);

  return bulk_request;
}