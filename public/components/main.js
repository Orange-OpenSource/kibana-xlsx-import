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
  EuiIcon,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiStepsHorizontal
} from '@elastic/eui';

import StepOne from './stepOne.js';

import "@elastic/eui/dist/eui_theme_k6_light.css";

const Main = (props) => {

  return(
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiHeader style={{width: "100%"}}> 
            <EuiHeaderSection>
              <EuiHeaderSectionItem border="right">
                <EuiFlexGroup justifyContent="center" style={{padding: "5px"}}>
                  <EuiFlexItem grow={false}>
                    <EuiIcon type="importAction" size="xxl"/>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiHeaderSectionItem>
              <EuiHeaderSectionItem>
                <EuiTitle style={{padding: "12px 5px 5px 15px"}}><h2>XLSX Import</h2></EuiTitle>
              </EuiHeaderSectionItem>

            </EuiHeaderSection>
          </EuiHeader>
        </EuiPageHeader>

        <EuiPageContent>
          <EuiPageContentHeader id="step">
            <EuiStepsHorizontal steps={props.steps} style={{backgroundColor: "white"}}/>
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
