import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, ChromeStart, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import Main from './components/main.js';
import { EuiStepsHorizontal} from '@elastic/eui';
import StepTwo from './components/stepTwo.js';
import StepThree from './components/stepThree.js';
import { i18n } from '@kbn/i18n';


let bulkSize;                                 // Taille maximal des paquets du bulk
let maxDisplayableElement;                    // Nombre d'element afficher dans la previs des données

let horizontalSteps = [
  {
    title: 'Choose a file',
    isSelected: true,
    isComplete: false,
    onClick: () => window.location.href = "#"
  },
  {
    title: 'Setup your index',
    isSelected: false,
    isComplete: false,
    onClick: () => window.location.href = "#"
  },
  {
    title: 'Done !',
    isSelected: false,
    isComplete: false,
    onClick: () => window.location.href = "#"
  }
]

const supportedFileType = ['xlsx', 'csv'];    // Defini les extensions utilisable dans le plugin

function setBreadcrumbs(chrome: ChromeStart) {
  chrome.setBreadcrumbs([
    {
      text: i18n.translate('devTools.k7BreadcrumbsDevToolsLabel', {
        defaultMessage: 'kibana-xlsx-import',
      }),
      href: '#/',
    },
  ]);
}
export const renderApp = (
  { notifications, http }: CoreStart,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters,
  chrome: ChromeStart,
) => {
  var i;
  for (i = 0; i < horizontalSteps.length; i++) { 
    horizontalSteps[i].isSelected = false;
    horizontalSteps[i].isComplete = false;
   } 
   horizontalSteps[0].isSelected = true;
  setBreadcrumbs(chrome);
  ReactDOM.render(
    <Main steps={horizontalSteps}  
      nextStep={displayStep2}
      basename={appBasePath}
      notifications={notifications}
      http={http}
      navigation={navigation}
    />,
    element
  );
  
  return () => ReactDOM.unmountComponentAtNode(element);
  // omment
 function displayStep2(fileName, sheetName, workbook, firstRow, columns) {
    horizontalSteps[0].isSelected = false;
    horizontalSteps[0].isComplete = true;
    horizontalSteps[1].isSelected = true;

    ReactDOM.render(
      <EuiStepsHorizontal steps={horizontalSteps} style={{backgroundColor: "white"}}/>,
      document.getElementById("step")
    );
    
    ReactDOM.render(
      <StepTwo 
        http={http}    
        notifications={notifications}    
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
};
