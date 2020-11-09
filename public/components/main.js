/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiStepsHorizontal,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiTitle,
  EuiText,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';



import StepOne from './stepOne.js';



export  const Main  =  ({
  steps,
  nextStep,
  basename,
  notifications,
  http,
  navigation,
}) => {
  
  /*http.get('/api/doc_editor/example/toto').then(res => {
    setTimestamp(res.time);
    // Use the core notifications service to display a success message.
    notifications.toasts.addSuccess(i18n.translate('myPluginName.dataUpdated', {
      defaultMessage: 'Data updated',
    }));
  });*/
/*export  const Main  =  (props) => {*/
  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
   
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiHeader style={{ width: "100%" }}>
            <EuiHeaderSection>
              <EuiHeaderSectionItem border="right">
              <EuiFlexGroup justifyContent="center" style={{ padding: "5px" }}>
                  <EuiFlexItem grow={false}>
                    <EuiIcon type="importAction" size="xxl" />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiHeaderSectionItem>
              <EuiHeaderSectionItem>
                <EuiTitle style={{ padding: "12px 5px 5px 15px" }}><h2>XLSX Import</h2></EuiTitle>
              </EuiHeaderSectionItem>

            </EuiHeaderSection>
          </EuiHeader>
        </EuiPageHeader>
        <EuiPageContent>
          <EuiPageContentHeader id="step">
                <EuiStepsHorizontal steps={steps} style={{ backgroundColor: "white" }} />
          </EuiPageContentHeader>
          <EuiPageContentBody id="main">
          <StepOne nextStep={nextStep} />
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
       

       </EuiPage>

 /* </EuiPageBody>   <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiHeader style={{ width: "100%" }}>
            <EuiHeaderSection>
              <EuiHeaderSectionItem border="right">
                <EuiFlexGroup justifyContent="center" style={{ padding: "5px" }}>
                  <EuiFlexItem grow={false}>
                    <EuiIcon type="importAction" size="xxl" />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiHeaderSectionItem>
              <EuiHeaderSectionItem>
                <EuiTitle style={{ padding: "12px 5px 5px 15px" }}><h2>XLSX Import</h2></EuiTitle>
              </EuiHeaderSectionItem>

            </EuiHeaderSection>
          </EuiHeader>
        </EuiPageHeader>

        <EuiPageContent>
          <EuiPageContentHeader id="step">
            <EuiStepsHorizontal steps={props.steps} style={{ backgroundColor: "white" }} />
          </EuiPageContentHeader>
          <EuiPageContentBody id="main">
            <StepOne nextStep={props.nextStep} />
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>

    </EuiPage> */
  );
};
export default Main;
