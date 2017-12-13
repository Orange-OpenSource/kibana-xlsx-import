import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';
import React from 'react';
import ReactDOM from 'react-dom';
import MyTable from './components/compo.js';

import 'ui/autoload/styles';
import './less/main.less';
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
import 'angular-spinner';
import template from './templates/index.html';


let jsonData;                       // Contient les données de conversion du xlxs 

const maxFileSize = 4;              // Taille du fichier xlxs avant warning 
const bulkSize = 3000;              // Taille maximal des paquets du bulk 
const maxDisplayableElement = 5;    // Nombre d'element afficher dans la previs des données

var app = uiModules.get('app/xlxs_import', ['angularSpinner']);

uiRoutes.enable();
uiRoutes
.when('/', {
  template : template
});


app.config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
    usSpinnerConfigProvider.setDefaults({color: 'black'});
}]);


app.controller('xlxsImport', function ($scope, $route, $interval, $http) {
  $scope.title = 'XLSX Import';
  $scope.description = 'Import XLSX to JSON';
  $scope.readOnlyIndexName = true;
  $scope.indexName = '';
  $scope.showSpinner = false;
  $scope.showTButton = false;


  $scope.transfer = function() {

    var promises = [];
    var bulk_request = [];
    var bulk_package = [];

    $scope.indexName = angular.element('#indexName').val();

    for(var i = 0; i < jsonData.data.length; i++) {
      bulk_package.push({index: { _index: $scope.indexName, _type: 'doc' } });
      bulk_package.push(jsonData.data[i]);

      if(bulk_package.length >= bulkSize) {
        bulk_request.push(bulk_package);
        bulk_package = [];
      }
    }
    bulk_request.push(bulk_package);

    bulk_request.forEach(function(split_bulk){
      $scope.showSpinner = true;                          //On affiche le spinner

      $http.post('../api/xlxs_import/'+ $scope.indexName +'/doc/_bulk', split_bulk)
        .then((response) => {
          console.log(response);
          promises.push(Promise.resolve(response));
      }).then(function(){
          if(promises.length === bulk_request.length) {   //On check si toutes les promesses sont dans le tableau
            $scope.showSpinner = false                    //On arrete le spinner
            Promise.all(promises).then(function(){        //On verifie si toutes les promesses sont correctes et on envoi un msg
              alert("Transfert des données terminé");
            }).catch(reason => {
              alert("une erreur est survenue : " + reason);
            });
          }
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

        reader.onload = function (file) {
          if (typeof FileReader !== "undefined") {

            var size = (changeEvent.target.files[0].size)/1000000;
            var message = "Votre fichier depasse la taille limite, voulez vous continuer ?";

            //Warning si file.size > maxFileSize (TBD)
            if(size > maxFileSize) {

              if(confirm(message)) {
                convert_data(reader);
                display_data("L'affichage a été limité aux premiers resultats");
              }
              else {
                return;
              }

            }
            else {
              convert_data(reader);
              display_data("");
            }
          }
        }; 
        reader.readAsBinaryString(changeEvent.target.files[0]);

        $scope.$parent.readOnlyIndexName = false;                                     //On rend le champ index editable
        $scope.$parent.indexName = setESIndexName(changeEvent.target.files[0].name);  //On lui donne la valeur par defaut formaté
        $scope.$parent.showTButton = true;                                            //On affiche le bouton de transfert
        $scope.$parent.$apply();
      });
    }
  };
});



//Traitement du fichier XLSX -> JSON
function convert_data(reader, message) {
  var fileData = reader.result;

  var wb = XLSX.read(fileData, {type : 'binary'});
  jsonData = new Object();

  wb.SheetNames.forEach(function(sheetName){
    update_sheet_range(wb.Sheets[sheetName]);
    jsonData.header = get_header_row(wb.Sheets[sheetName]);
    jsonData.data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
  })
}

//Affichage des données dans une table html après conversion
function display_data(message) {
    var headers = '';
    var body = '';

      if(message)
      document.getElementById("message").innerHTML = '<pre style="background-color:rgba(255, 0, 0, 0.4);">' + message + '</pre>';

    ReactDOM.render(
      <MyTable data={jsonData} maxElement={maxDisplayableElement}/>,
      document.getElementById("react_preview")
    ); 

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

        headers.push(hdr);
    }
    return headers;
}

//Formate le nom du fichier pour le transformer en nom d'index ES correct
function setESIndexName(name) {
  
  var name = name.split('.')[0];                //on enlève l'extension du fichier
  var name = name.replace(/[^a-zA-Z ]/g, "");   //on enlève aussi les charactères speciaux (modif possible avec UTF?)
  return name;
}
