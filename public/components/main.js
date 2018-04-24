import React, {
  Component,
} from 'react';

import {
  EuiPage,
  EuiPageHeader,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentBody,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderBreadcrumbs,
  EuiHeaderBreadcrumb,
  EuiHeaderSectionItemButton,
  EuiHeaderLogo,
  EuiImage,
  EuiIcon
} from '@elastic/eui';

import StepOne from './stepOne.js';

const Main = (props) => {

  return(
    <EuiPage>

      <EuiPageHeader>
        <EuiHeader style={{width: "100%"}}>
          <EuiHeaderSection>
            <EuiHeaderSectionItem border="right">
              <EuiHeaderBreadcrumb>
                <EuiIcon type="importAction" size="m" />
              </EuiHeaderBreadcrumb>
            </EuiHeaderSectionItem>

            <EuiHeaderSectionItem>
              <EuiHeaderBreadcrumbs>
               <EuiHeaderBreadcrumb>
                 XLSX Import
               </EuiHeaderBreadcrumb>
             </EuiHeaderBreadcrumbs>
            </EuiHeaderSectionItem>

          </EuiHeaderSection>
        </EuiHeader>
      </EuiPageHeader>

      <EuiPageBody>
        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiImage alt="steps" url="../plugins/xlsx-import/ressources/progress-step1.png" />
          </EuiPageContentHeader>
          <EuiPageContentBody id="main">
            <StepOne nextStep={props.nextStep}/>
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>

    </EuiPage>
  );

};

export default Main
