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

import axios from 'axios';
import XLSX from 'xlsx';
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

    axios.defaults.headers.post['kbn-xsrf'] = "reporting";
  }

  async handleNextStep(e) {
    e.preventDefault();

    this.setState({uploadButton:{text:"Loading...", loading:true}});
    var first_worksheet = this.props.workbook.Sheets[this.props.workbook.SheetNames[0]];
    var data = XLSX.utils.sheet_to_json(first_worksheet);

    try {
      const response = await axios.post(`../api/xlsx_import/${this.props.indexName}/doc`, data[0])
      this.props.job();
    } catch (error) {
      console.log(error);
      this.setState({uploadButton:{text:"Import", loading:false}});
    }
  };

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
              <EuiButton fill onClick={this.handleNextStep} iconType="importAction" isLoading={this.state.uploadButton.loading}>
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
