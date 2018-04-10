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

    this.state = {
      uploadButton: {
        text : "Import",
        loading: false
      }
    };

    this.handleNextStep = this.handleNextStep.bind(this);
    this.backClick = this.backClick.bind(this);
  }

  handleNextStep(e) {
    this.setState({uploadButton:{text:"Loading...", loading:true}});
    this.props.job("bonjour");
  }

  backClick(e) {
    window.location.reload();
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

        <EuiSpacer size="s" />

        <EuiFormRow>
          <EuiAccordion id="mapping" buttonContent="Configure mapping">

            <EuiSpacer size="m" />

            <EuiFormRow>
              <EuiSwitch label="Use your own mapping ?"/>
            </EuiFormRow>

            <MappingTable items={this.props.items}/>
          </EuiAccordion>
        </EuiFormRow>

        <EuiFormRow>
          <EuiFlexGroup gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={this.backClick} size="s" iconType="arrowLeft">
                back
              </EuiButtonEmpty>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButton onClick={this.handleNextStep} iconType="importAction" isLoading={this.state.uploadButton.loading}>
                {this.state.uploadButton.text}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>

      </EuiForm>
    );
  }
}

export default StepTwo
