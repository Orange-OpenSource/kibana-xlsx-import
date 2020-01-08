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


  function displayStep2(fileName, sheetName, workbook, firstRow, columns) {
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
        fileName={fileName}
        sheetName={sheetName}
        columns={columns}
        firstRow = {firstRow}
        nextStep={displayStep3}
        workbook={workbook}
        bulksize={bulkSize}
      />,
      document.getElementById("main")
    );
  }


  function displayStep3(indexName, sheetName, fileName, nbDocument) {
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
        sheetName={sheetName}
        fileName={fileName}
        nbDocument={nbDocument} />,
      document.getElementById("main")
    );
  }
}

chrome.setRootController("root", RootController);

