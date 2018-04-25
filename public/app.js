import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';
import chrome from 'ui/chrome';
import template from './templates/index.html';
import React from 'react';
import ReactDOM from 'react-dom';
import {EuiImage} from '@elastic/eui';
import Main from './components/main.js';
import PreviewTable from './components/previewTable.js';
import StepOne from './components/stepOne.js';
import StepTwo from './components/stepTwo.js';
import StepThree from './components/stepThree.js';

import 'ui/autoload/styles';
import './less/main.less';

/*
let jsonData;                                 // Contient les données de conversion du xlxs
let fileInfo;                                 // Contient les informations sur le fichier upload (data, name, size)
let workbook;*/

let bulkSize;                                 // Taille maximal des paquets du bulk
let maxDisplayableElement;                    // Nombre d'element afficher dans la previs des données

const supportedFileType = ['xlsx', 'csv'];    // Defini les extensions utilisable dans le plugin

var app = uiModules.get('app/xlsx_import', []);

uiRoutes.enable();
uiRoutes
.when('/', {
  template : template
});


app.controller('xlsxImport', function ($scope, $route, $interval, $http, $timeout, config) {
  bulkSize = config.get('xlsx-import:bulk_package_size');
  maxDisplayableElement = config.get('xlsx-import:displayed_rows');

  $scope.title = 'XLSX Import';

  $scope.topNavMenu = [
    {
      key: 'XLSX Import',
      description: 'Home',
      run: function () { kbnUrl.change('/'); }
    }
  ];

  /*$scope.indexName = '';
  $scope.showSheetForm = false;
  $scope.sheetnames = [];
  $scope.sheetname = '';
  $scope.firstRow = '';*/


  $scope.on = function() {
    ReactDOM.render(
      <Main nextStep={$scope.displayStep2}/>,
      document.getElementById("myapp")
    );
  }

  /*$scope.step1Job = function() {

    //All csv files are read as UTF-8 (need to fix later)
    if(fileInfo.ext != "csv")
      workbook = XLSX.read(fileInfo.data, {type : 'array'});
    else {
      workbook = XLSX.read(fileInfo.data, {type : 'binary'});
    }

    if(workbook.Sheets[$scope.sheetname]['!ref'] != undefined){
      var range = XLSX.utils.decode_range(workbook.Sheets[$scope.sheetname]['!ref']);
      if(range.e.r > maxDisplayableElement) range.e.r = maxDisplayableElement;

      var exceltojson = new Object();
      exceltojson.header = get_header_row(workbook.Sheets[$scope.sheetname]);
      exceltojson.data = formatJSON(XLSX.utils.sheet_to_json(workbook.Sheets[$scope.sheetname], {range: range}));
      $scope.firstRow = exceltojson.data[0];

      var columns = exceltojson.header.map((s) => ({
        field: s,
        name: s,
        truncateText: true
      }));

      ReactDOM.render(
        <PreviewTable items={exceltojson.data} columns={columns}/>,
        document.getElementById("dataPreviewContainer")
      );

      angular.element('#nextButton').attr('disabled', false);

    } else {
      ReactDOM.render(
        <EuiText color="danger"><p>No data found</p></EuiText>,
        document.getElementById("dataPreviewContainer")
      );

      angular.element('#nextButton').attr('disabled', true);
    }
  }*/


  $scope.displayStep2 = function(indexname, workbook, sheetname, firstrow) {
    //document.getElementById("progress-img").innerHTML = '<img src="../plugins/xlsx-import/ressources/progress-step2.png"/>'

    ReactDOM.render(
      <EuiImage alt="steps" url="../plugins/xlsx-import/ressources/progress-step2.png" />,
      document.getElementById("step")
    );

    ReactDOM.render(
      <StepTwo
        indexName={indexname}
        header={get_header_row(workbook.Sheets[sheetname])}
        items={getHeaderWithType(workbook.Sheets[sheetname])}
        firstRow = {firstrow}
        nextStep={$scope.displayStep3}
        workbook={workbook}
        sheetname={sheetname}
        bulksize={bulkSize}
      />,
      document.getElementById("main")
    );
  }


  $scope.displayStep3 = function(indexName, sheetname , filename, nbDocument) {
    //document.getElementById("progress-img").innerHTML = '<img src="../plugins/xlsx-import/ressources/progress-step3.png"/>'
    ReactDOM.render(
      <EuiImage alt="steps" url="../plugins/xlsx-import/ressources/progress-step3.png" />,
      document.getElementById("step")
    );

    ReactDOM.render(
      <StepThree
        indexName={indexName}
        sheetName={sheetname}
        fileName={filename}
        nbDocument={nbDocument} />,
      document.getElementById("main")
    );
  }
});


/*app.directive('importSheetJs', function() {
  return {
    scope: { opts: '=' },
    link: function ($scope, $elm, $attrs) {

      $elm.on('change', function (changeEvent) {
        var reader = new FileReader();
        fileInfo = new Object();

        if (!supportedFileType.includes(getExtension(changeEvent.target.files[0].name)[0])) {
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
});*/


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
