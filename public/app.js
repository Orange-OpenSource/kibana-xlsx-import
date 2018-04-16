import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';
import template from './templates/index.html';
import React from 'react';
import ReactDOM from 'react-dom';
import {EuiToast} from '@elastic/eui';
import Table from './components/stepOne.js';
import StepTwo from './components/stepTwo.js';
import StepThree from './components/stepThree.js';

import 'ui/autoload/styles';
import './less/main.less';
import 'fixed-data-table-2/dist/fixed-data-table.css';

import 'angular-spinner';
import 'angular-translate';
import 'angular-translate-loader-static-files';


let jsonData;                                 // Contient les données de conversion du xlxs
let fileInfo;                                 // Contient les informations sur le fichier upload (data, name, size)
let workbook;

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
  //$scope.esID = '';
  //$scope.showUploadOptions = false;
  //$scope.showSpinner = false;
  $scope.showSheetForm = false;
  $scope.sheetnames = [];
  $scope.sheetname = '';
  $scope.firstRow = '';


  $scope.useTranslation = function() {
    switch(default_language) {
      case "Browers":
        //Default case already done by the config
        break;
      case "English":
        $scope.changeLanguage('en');
        break;
      case "Français":
        $scope.changeLanguage('fr');
        break;
    }
  }


  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey).then(function(){}, function(){toastr.error('JSON translate file is invalid')})
  };


  $scope.previewDocID = function() {
    $scope.previewID = createDocumentId($scope.esID, jsonData.data[0]);
  }


  $scope.step1Job = function() {

    //All csv files are read as UTF-8 (need to fix later)
    if(fileInfo.ext != "csv")
      workbook = XLSX.read(fileInfo.data, {type : 'array'});
    else {
      workbook = XLSX.read(fileInfo.data, {type : 'binary'});
    }

    var range = XLSX.utils.decode_range(workbook.Sheets[$scope.sheetname]['!ref']);
    if(range.e.r > maxDisplayableElement) range.e.r = maxDisplayableElement;

    var exceltojson = new Object();
    exceltojson.header = get_header_row(workbook.Sheets[$scope.sheetname]);
    exceltojson.data = formatJSON(XLSX.utils.sheet_to_json(workbook.Sheets[$scope.sheetname], {range: range}));
    $scope.firstRow = exceltojson.data[0];

    var columns = exceltojson.header.map((s) => ({
      field: s,
      name: s
    }));

    ReactDOM.render(
      <Table items={exceltojson.data} columns={columns}/>,
      document.getElementById("dataPreviewContainer")
    );

    angular.element('#nextButton').removeAttr('disabled');
  }


  $scope.displayStep2 = function() {
    document.getElementById("progress-img").innerHTML = '<img src="../plugins/xlsx-import/ressources/progress-step2.png"/>'

    ReactDOM.render(
      <StepTwo
        indexName={$scope.indexName}
        header={get_header_row(workbook.Sheets[$scope.sheetname])}
        items={getHeaderWithType(workbook.Sheets[$scope.sheetname])}
        firstRow = {$scope.firstRow}
        nextStep={$scope.displayStep3}
        workbook={workbook}/>,
      document.getElementById("content")
    );
  }


  $scope.displayStep3 = function(indexName, nbDocument) {
    document.getElementById("progress-img").innerHTML = '<img src="../plugins/xlsx-import/ressources/progress-step3.png"/>'
    ReactDOM.render(
      <StepThree
        indexName={indexName}
        sheetName={$scope.sheetname}
        fileName={fileInfo.name}
        nbDocument={nbDocument} />,
      document.getElementById("content")
    );
  }
});


app.directive('importSheetJs', function($translate) {
  return {
    scope: { opts: '=' },
    link: function ($scope, $elm, $attrs) {

      $elm.on('change', function (changeEvent) {
        var reader = new FileReader();
        fileInfo = new Object();

        if (!supportedFileType.includes(getExtension(changeEvent.target.files[0].name)[0])) {
          alert($translate.instant("INVALID_EXTENSION_FILE_MESSAGE"));
          return
        }

          reader.onload = function (file) {
            if (typeof FileReader !== "undefined") {

              fileInfo.size = (changeEvent.target.files[0].size)/1000000;
              fileInfo.data = reader.result;
              fileInfo.name = changeEvent.target.files[0].name;
              fileInfo.ext = getExtension(changeEvent.target.files[0].name)[0];

              var wb = XLSX.read(fileInfo.data, {type : 'array', bookSheets: 'true'});

              $scope.$parent.sheetnames = wb.SheetNames;
              $scope.$parent.showSheetForm = true;
              $scope.$parent.$apply();
            }
          };
          if(getExtension(changeEvent.target.files[0].name)[0] != "csv")
            reader.readAsArrayBuffer(changeEvent.target.files[0]);
          else {
            reader.readAsText(changeEvent.target.files[0]);
          }

          $scope.$parent.indexName = setESIndexName(changeEvent.target.files[0].name);  //On lui donne la valeur par defaut formaté
          $scope.$parent.$apply();

      });
    }
  };
});


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

//Recupère les types des colonnes de la feuille excel
function getHeaderWithType(sheet) {
    var types = [];
    var range = XLSX.utils.decode_range(sheet['!ref']);
    var C, R = range.s.r; /* start in the first row */
    /* walk every column in the range */
    for(C = range.s.c; C <= range.e.c; ++C) {
        var type = new Object();

        var cell = sheet[XLSX.utils.encode_cell({c:C, r:R})] /* find the cell in the first row */
        if(cell && cell.t) {
          type.name = XLSX.utils.format_cell(cell);
        }

        cell = sheet[XLSX.utils.encode_cell({c:C, r:R+1})] /* find the cell in the second row */

        var hdr = "UNKNOWN " + C; // <-- replace with your desired default
        if(cell && cell.t) {
          switch(cell.t) {
            case "s":
              hdr = "text";
              break;
            case "n":
              hdr = "float";
              break;
            case "d":
              hdr = "date";
              break;
            case "b":
              hdr = "boolean";
              break;
          }
          type.type = hdr;
        }
        types.push(type);
    }
    return types;
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
