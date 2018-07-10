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

      <EuiPageHeader>
        <EuiHeader style={{width: "100%", height: "70px"}}>
          <EuiHeaderSection>
            <EuiHeaderSectionItem border="right" style={{width: "5%"}}>
              <EuiFlexGroup justifyContent="center" style={{paddingTop: "15px"}}>
                <EuiFlexItem grow={false}>
                  <EuiIcon type="addDataApp" size="xxl"/>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiHeaderSectionItem>

            <EuiHeaderSectionItem>
              <EuiTitle style={{paddingTop: "20px", paddingLeft: "10px"}}><h2>XLSX Import</h2></EuiTitle>
            </EuiHeaderSectionItem>

          </EuiHeaderSection>
        </EuiHeader>
      </EuiPageHeader>

      <EuiPageBody>
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
