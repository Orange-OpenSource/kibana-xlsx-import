import React, {
  Component,
} from 'react';

import {
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiSwitch,
  EuiAccordion,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty
} from '@elastic/eui';

import MappingTable from './mappingTable.js';

class StepTwo extends Component {
  constructor(props) {
    super(props);

    this.state = {loading: false};

    this.handleNextStep = this.handleNextStep.bind(this);
  }

  handleNextStep(e) {
    this.setState({loading:true});
    this.props.job();
  }

  render() {
    return (
      <EuiForm>
        <EuiFormRow label="Index name">
          <EuiFieldText id="indexName" defaultValue={this.props.indexName}/>
        </EuiFormRow>

        <EuiFormRow
        label="Kibana custom ID"
        helpText="Kibana will provide a unique identifier for each index pattern. If you do not want to use this unique ID, enter a custom one.">
          <EuiFlexGroup gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiFieldText id="kbnID"/>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiFieldText id="previewKbnID" placeholder="Custom ID preview" readOnly/>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>

        <EuiFormRow>
          <EuiSwitch label="Use your own mapping ?"/>
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiFormRow>
          <EuiAccordion id="map" buttonContent="Show mapping">
            <MappingTable items={this.props.items}/>
          </EuiAccordion>
        </EuiFormRow>

        <EuiFormRow>
          <EuiFlexGroup gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButton onClick={this.handleNextStep} iconType="arrowRight" isLoading={this.state.loading}>
                Next
              </EuiButton>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButtonEmpty size="s" iconType="arrowLeft">
                back
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>

      </EuiForm>
    );
  }
}

export default StepTwo
