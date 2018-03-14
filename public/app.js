import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';
import template from './templates/index.html';
import React from 'react';
import ReactDOM from 'react-dom';
import MyTable from './components/mytable.js';
import MyMapping from './components/mymapping.js';
import MyTabs from './components/mytabs.js';

import 'ui/autoload/styles';
import './less/main.less';
import 'fixed-data-table-2/dist/fixed-data-table.css';

import 'angular-spinner';
import 'angular-translate';
import 'angular-translate-loader-static-files';


let jsonData;                                 // Contient les données de conversion du xlxs
let fileInfo;                                 // Contient les informations sur le fichier upload (data, name, size)

let maxFileSize;                              // Taille du fichier xlxs avant warning
let bulkSize;                                 // Taille maximal des paquets du bulk
let maxDisplayableElement;                    // Nombre d'element afficher dans la previs des données
let default_language;

const supportedFileType = ['xlsx', 'csv'];    // Defini les extensions utilisable dans le plugin

var app = uiModules.get('app/xlsx_import', ['angularSpinner', 'pascalprecht.translate']);

uiRoutes.enable();
uiRoutes
.when('/', {
  template : template
});


app.config(['$translateProvider', function($translateProvider, config){
  //angular-translate security
  $translateProvider.useSanitizeValueStrategy('escape');

  //Path for loading translation files [prefix][filename][suffix]
  $translateProvider.useStaticFilesLoader({
    prefix: '../plugins/xlsx-import/i18n/',
    suffix: '.json'
  });

  // Tell the module what language to use by default
  var userLang = navigator.language || navigator.userLanguage;
  if(userLang === 'fr')
    $translateProvider.preferredLanguage('fr');
  else
    $translateProvider.preferredLanguage('en');

}])

app.config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
  usSpinnerConfigProvider.setDefaults({color: 'black'});
}])


app.controller('xlsxImport', function ($scope, $route, $interval, $http, $translate, $timeout, config) {
  maxFileSize = config.get('xlsx-import:filesize_warning');
  bulkSize = config.get('xlsx-import:bulk_package_size');
  maxDisplayableElement = config.get('xlsx-import:displayed_elements');
  default_language = config.get('xlsx-import:default_language');

  $scope.title = 'XLSX Import';
  $scope.description = $translate.instant('PLUGIN_DESCRIPTION');

  $scope.topNavMenu = [
    {
      key: 'XLSX Import',
      description: 'Home',
      run: function () { kbnUrl.change('/'); }
    }
  ];

  $scope.indexName = '';
  $scope.esID = '';
  $scope.showUploadOptions = false;
  $scope.showSpinner = false;
  $scope.showSheetForm = false;
  $scope.sheetnames = [];
  $scope.sheetname = '';

  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey).then(function(){}, function(){toastr.error('JSON translate file is invalid')})
  };

  $scope.useTranslation = function() {
    if(default_language == 'Browser') {
      var userLang = navigator.language || navigator.userLanguage;
      if(userLang === 'fr')
        $translate.use('fr');
      else
        $translate.use('en');
    }
    else {
      switch(default_language) {
        case "English":
          $translate.use('en');
          break;
        case "Français":
          $translate.use('fr');
          break;
      }
    }
  }


  $scope.previewDocID = function() {
    //angular.element('#previewID').val(createDocumentId($scope.esID, jsonData.data[0]));
    $scope.previewID = createDocumentId($scope.esID, jsonData.data[0]);
  }


  $scope.convert = function() {

    if($scope.sheetname === '')
      return;

    var tabNames = [$translate.instant('PERSONAL_MAPPING_LABEL'), $translate.instant('VIEW_TABS_NAME'), $translate.instant('MAPPING_TAB_NAME')];

    $scope.showSpinner = true;
    //console.log(config.getAll());

    //Warning si file.size > maxFileSize (TBD)
    if(fileInfo.size > maxFileSize) {

      if(confirm($translate.instant('SIZE_WARNING_MESSAGE'))) {
        $timeout(function() {}, 10).then(function(){
          convert_data($scope.sheetname, function(){
            document.getElementById("import_form").innerHTML =
              '<button class="btn btn-primary" type="button" onclick="location.reload();">'+ $translate.instant('REFRESH_BUTTON') +'</button> ' + fileInfo.name;
            $scope.showSpinner = false;
            $scope.showUploadOptions = true;
            display_UI($translate.instant('DISPLAY_LIMIT_MESSAGE'), tabNames);
          });
        })
      }
      else {
        //On enleve l'affichage des champs et du spinner si la conversion est annulée
        $scope.showSpinner = false;
        $scope.showUploadOptions = false;
        return;
      }

    }
    else {
      $timeout(function() {}, 10).then(function(){
        convert_data($scope.sheetname, function(){
          document.getElementById("import_form").innerHTML =
            '<p><button class="btn btn-primary btn-metriks" type="button" onclick="location.reload();">'+ $translate.instant('REFRESH_BUTTON') +'</button> '+ fileInfo.name;
          $scope.showSpinner = false;
          $scope.showUploadOptions = true;
          display_UI("", tabNames);
        });
      })
    }

    $scope.showSheetForm = false;
  }


  $scope.transfer = function() {

    var promises = [];
    var bulk_request = [];

    $scope.indexName = angular.element('#indexName').val();
    $scope.esID = angular.element('#esID').val();
    $scope.showSpinner = true;    //On affiche le spinner

    if(document.getElementById('checkMapping').checked){    //Si l'utilisateur souhaite choisir son propre mapping

      $http.get('../api/xlsx_import/' + $scope.indexName + '/_exists')    //On verifie si l'index existe déjà
        .then((response) => {
          console.log(response);
          if(response.data.status != 404) {   //Si l'index existe déjà, on envoi un message et on annule le push
            alert($translate.instant('INDEX_ALREADY_EXIST_MESSAGE'));
            $scope.showSpinner = false;
            return;
          }
          else {

            var mapping_request = createMappingJson();

            $http.post('../api/xlsx_import/'+ $scope.indexName)  //On crée l'index dans ES
              .then((response) => {
                console.log(response);

                if(response.data.error != undefined) {  //Handle errors on index creation
                  alert(response.data.error.msg);
                  $scope.showSpinner = false;
                  return;
                }

                $http.put('../api/xlsx_import/'+ $scope.indexName +'/_mapping/doc', mapping_request)  //On attribut le mapping dynamique
                  .then(function onSuccess(response){
                    console.log(response);

                    bulk_request = createBulk($scope.indexName, $scope.esID);

                    bulk_request.forEach(function(split_bulk){

                    $http.post('../api/xlsx_import/'+ $scope.indexName +'/doc/_bulk', split_bulk)   //On push les data avec le bulk
                      .then((response) => {
                        console.log(response);
                        promises.push(Promise.resolve(response));
                      }).then(function(){
                        if(promises.length === bulk_request.length) {   //On check si toutes les promesses sont dans le tableau
                          $scope.showSpinner = false                    //On arrete le spinner
                          Promise.all(promises).then(function(){        //On verifie si toutes les promesses sont correctes et on envoi un msg
                            alert($translate.instant('SUCCESS_TRANSFER_MESSAGE') + ' ('+jsonData.data.length+' elements)');
                          }).catch(reason => {
                            alert($translate.instant('FAILED_TRANSFER_MESSAGE'));
                          });
                        }
                      });
                    })
                  });
              });
          }
        }).catch(function onError(response){  //Handle network errors
            console.log(response);
            $scope.showSpinner = false
            return;
        });
    }
    else {    //Si l'utilisateur ne souhaite pas de mapping perso, on push juste les données

        $http.get('../api/xlsx_import/' + $scope.indexName + '/_exists')    //On verifie si l'index existe déjà
        .then((response) => {
          console.log(response);
          if(response.data.status != 404) {   //Si l'index existe déjà, on push

            bulk_request = createBulk($scope.indexName, $scope.esID);

            bulk_request.forEach(function(split_bulk){

            $http.post('../api/xlsx_import/'+ $scope.indexName +'/doc/_bulk', split_bulk)
              .then((response) => {
                console.log(response);
                promises.push(Promise.resolve(response));
              }).then(function(){
                if(promises.length === bulk_request.length) {   //On check si toutes les promesses sont dans le tableau
                  $scope.showSpinner = false                    //On arrete le spinner
                  Promise.all(promises).then(function(){        //On verifie si toutes les promesses sont correctes et on envoi un msg
                    alert($translate.instant('SUCCESS_TRANSFER_MESSAGE') + ' ('+jsonData.data.length+' elements)');
                  }).catch(reason => {
                    alert($translate.instant('FAILED_TRANSFER_MESSAGE'));
                  });
                }
              });
            })
          } else {  //Si il n'existe pas on verifie qu'on peut le créer et on push

            $http.post('../api/xlsx_import/'+ $scope.indexName)  //On crée l'index dans ES
              .then((response) => {
                console.log(response);

                if(response.data.error != undefined) {  //Handle errors on index creation
                  alert(response.data.error.msg);
                  $scope.showSpinner = false;
                  return;
                }

                bulk_request = createBulk($scope.indexName, $scope.esID);

                bulk_request.forEach(function(split_bulk){

                $http.post('../api/xlsx_import/'+ $scope.indexName +'/doc/_bulk', split_bulk)
                  .then((response) => {
                    console.log(response);
                    promises.push(Promise.resolve(response));
                  }).then(function(){
                    if(promises.length === bulk_request.length) {   //On check si toutes les promesses sont dans le tableau
                      $scope.showSpinner = false                    //On arrete le spinner
                      Promise.all(promises).then(function(){        //On verifie si toutes les promesses sont correctes et on envoi un msg
                        alert($translate.instant('SUCCESS_TRANSFER_MESSAGE') + ' ('+jsonData.data.length+' elements)');
                      }).catch(reason => {
                        alert($translate.instant('FAILED_TRANSFER_MESSAGE'));
                      });
                    }
                  });
                })
              });
          }
      });
    }
  }

});


app.directive('importSheetJs', function($translate) {
  return {
    scope: { opts: '=' },
    link: function ($scope, $elm, $attrs) {

      $elm.on('change', function (changeEvent) {
        var reader = new FileReader();

        if (!supportedFileType.includes(getExtension(changeEvent.target.files[0].name)[0])) {
          alert($translate.instant("INVALID_EXTENSION_FILE_MESSAGE"));
          return
        }

          reader.onload = function (file) {
            if (typeof FileReader !== "undefined") {

              fileInfo = new Object();
              fileInfo.size = (changeEvent.target.files[0].size)/1000000;
              fileInfo.data = reader.result;
              fileInfo.name = changeEvent.target.files[0].name;

              var wb = XLSX.read(fileInfo.data, {type : 'binary', bookSheets: 'true'});

              $scope.$parent.sheetnames = wb.SheetNames;
              $scope.$parent.showSheetForm = true;
              $scope.$parent.$apply();
            }
          };
          reader.readAsBinaryString(changeEvent.target.files[0]);

          $scope.$parent.indexName = setESIndexName(changeEvent.target.files[0].name);  //On lui donne la valeur par defaut formaté                                            //On affiche le bouton de transfert
          $scope.$parent.$apply();

      });
    }
  };
});



//Traitement du fichier XLSX -> JSON
function convert_data(sheetname, callback) {

  jsonData = new Object();
  var wb = XLSX.read(fileInfo.data, {type : 'binary'});

  update_sheet_range(wb.Sheets[sheetname]);
  jsonData.header = get_header_row(wb.Sheets[sheetname]);
  jsonData.data = formatJSON(XLSX.utils.sheet_to_json(wb.Sheets[sheetname]));

  if (typeof callback === "function")
    callback();
}

//Affichage des données dans une table html après conversion
function display_UI(message ,tabNames) {

    if(message)
      document.getElementById("message").innerHTML = '<span class="label label-danger" style="font-size: 14px;">' + message + '</span><br/>';

    ReactDOM.render(
      <MyTabs names={tabNames}/>,
      document.getElementById("react_tabs")
    );

    ReactDOM.render(
      <MyTable data={jsonData} maxElement={maxDisplayableElement}/>,
      document.getElementById("view_tab")
    );

    ReactDOM.render(
      <MyMapping data={jsonData.header} />,
      document.getElementById("mapping_tab")
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

        headers.push(formatHeader(hdr));
    }
    return headers;
}

//Formate le nom du fichier pour le transformer en nom d'index ES correct
function setESIndexName(name) {

  var name = name.split('.')[0];                //on enlève l'extension du fichier
  var name = name.replace(/[^a-zA-Z ]/g, "");   //on enlève aussi les charactères speciaux (modif possible avec UTF?)
  name = name.toLowerCase();                    //on passe tout en lowercase (contrainte des nom d'index dans ES)
  return name;
}

//Retourne l'extension d'un fichier
function getExtension(filename) {
  return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}

//Crée les données JSON pour le mapping dynamique
function createMappingJson() {
  var mapping_request = '{ "properties": {';

  for(var i = 0; i < jsonData.header.length; i++) {

    if(angular.element('#' + jsonData.header[i]).val() === 'text')
      mapping_request += '"'+ jsonData.header[i] +'": { "type": "'+ angular.element('#' + jsonData.header[i]).val() +'", "fields": { "keyword": { "type": "keyword" } } }';
    else
      mapping_request += '"'+ jsonData.header[i] +'": { "type": "'+ angular.element('#' + jsonData.header[i]).val() +'" }';

    if(i < jsonData.header.length -1)
      mapping_request += ','
    }

    mapping_request += '} }';

    return mapping_request;
}

//Crée les données JSON pour le bulk
function createBulk(indexName, esId) {
  var bulk_request = [];
  var bulk_package = [];

  for(var i = 0; i < jsonData.data.length; i++) {
    if(esId === '')
      bulk_package.push({index: { _index: indexName, _type: 'doc' } });
    else
      bulk_package.push({index: { _index: indexName, _type: 'doc', _id: createDocumentId(esId, jsonData.data[i]) } });
    bulk_package.push(jsonData.data[i]);

    if(bulk_package.length >= bulkSize) {
      bulk_request.push(bulk_package);
      bulk_package = [];
    }
  }
  bulk_request.push(bulk_package);

  return bulk_request;
}

//Replace all space in json header
function formatHeader(header){
  return header.replace(/ /g,"_");
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

//Create the document ID by using the template in $scope.esID
function createDocumentId(template, obj) {
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
