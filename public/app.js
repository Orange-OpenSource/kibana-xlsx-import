import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';
import chrome from 'ui/chrome';
import template from './templates/index.html';
import React from 'react';
import ReactDOM from 'react-dom';
import {EuiImage, EuiStepsHorizontal} from '@elastic/eui';
import Main from './components/main.js';
import PreviewTable from './components/previewTable.js';
import StepOne from './components/stepOne.js';
import StepTwo from './components/stepTwo.js';
import StepThree from './components/stepThree.js';
import XLSX from 'xlsx';

import 'ui/autoload/styles';
import './less/main.less';

/*
let jsonData;                                 // Contient les données de conversion du xlxs
let fileInfo;                                 // Contient les informations sur le fichier upload (data, name, size)
let workbook;*/

let bulkSize;                                 // Taille maximal des paquets du bulk
let maxDisplayableElement;                    // Nombre d'element afficher dans la previs des données

let horizontalSteps = [
  {
    title: 'Choose a file',
    isSelected: true,
    isComplete: false,
    onClick: () => window.location = "#"
  },
  {
    title: 'Setup your index',
    isSelected: false,
    isComplete: false,
    onClick: () => window.location = "#"
  },
  {
    title: 'Done !',
    isSelected: false,
    isComplete: false,
    onClick: () => window.location = "#"
  }
]

const supportedFileType = ['xlsx', 'csv'];    // Defini les extensions utilisable dans le plugin


var app = uiModules.get('app/kibana-xlsx-import', []);

/*uiRoutes.enable();
uiRoutes
.when('/', {
  template : template
});*/

app.config($locationProvider => {
  $locationProvider.html5Mode({
    enabled: false,
    requireBase: false,
    rewriteLinks: false,
  });
});
app.config(stateManagementConfigProvider =>
  stateManagementConfigProvider.disable()
);

function RootController($scope, $element, config) {
  const domNode = $element[0];
  bulkSize = config.get('kibana-xlsx-import:bulk_package_size');
  maxDisplayableElement = config.get('kibana-xlsx-import:displayed_rows');

  // render react to DOM
  ReactDOM.render( <Main steps={horizontalSteps} nextStep={displayStep2}/>, domNode);

  // unmount react on controller destroy
  $scope.$on('$destroy', () => {
    unmountComponentAtNode(domNode);
  });


  function displayStep2(indexname, workbook, sheetname, firstrow) {
    //document.getElementById("progress-img").innerHTML = '<img src="../plugins/kibana-xlsx-import/ressources/progress-step2.png"/>'
    horizontalSteps[0].isSelected = false;
    horizontalSteps[0].isComplete = true;
    horizontalSteps[1].isSelected = true;

    ReactDOM.render(
      <EuiStepsHorizontal steps={horizontalSteps} style={{backgroundColor: "white"}}/>,
      document.getElementById("step")
    );

    ReactDOM.render(
      <StepTwo
        indexName={indexname}
        header={get_header_row(workbook.Sheets[sheetname])}
        items={getHeaderWithType(workbook.Sheets[sheetname])}
        firstRow = {firstrow}
        nextStep={displayStep3}
        workbook={workbook}
        sheetname={sheetname}
        bulksize={bulkSize}
      />,
      document.getElementById("main")
    );
  }


  function displayStep3(indexName, sheetname , filename, nbDocument) {
    //document.getElementById("progress-img").innerHTML = '<img src="../plugins/kibana-xlsx-import/ressources/progress-step3.png"/>'
    horizontalSteps[1].isSelected = false;
    horizontalSteps[1].isComplete = true;
    horizontalSteps[2].isSelected = true;

    ReactDOM.render(
      <EuiStepsHorizontal steps={horizontalSteps} style={{backgroundColor: "white"}}/>,
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
}

chrome.setRootController("root", RootController);


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


//Replace all space in json header
function formatHeader(header){
  return header.replace(/ /g,"_");
}

