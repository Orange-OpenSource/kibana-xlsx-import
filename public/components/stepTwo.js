import React, {
  Component
} from 'react';

import ReactDOM from 'react-dom';

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

import axios from 'axios';
import XLSX from 'xlsx';

import {
  createBulk,
  createMapping
} from '../services/services.js';


class StepTwo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uploadButton: {
        text : "Import",
        loading: false
      },
      switchMap: {
        value: false
      }
    };

    this.switchChange = this.switchChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleNextStep = this.handleNextStep.bind(this);
    this.backClick = this.backClick.bind(this);

    axios.defaults.headers.post['kbn-xsrf'] = "reporting";
    axios.defaults.headers.put['kbn-xsrf'] = "reporting";
  }

  switchChange(e) {
    this.setState({switchMap:{checked: e.target.checked}});
  }

  handleClick(e){
    this.setState({uploadButton:{text:"Loading...", loading:true}}, function() {
      this.handleNextStep();
    });
  }

  async handleNextStep() {
    var ws = this.props.workbook.Sheets[this.props.workbook.SheetNames[0]];

    try {
      const json = await XLSX.utils.sheet_to_json(ws);

      if(this.state.switchMap.checked) {
        const resIndex = await axios.post(`../api/xlsx_import/${this.props.indexName}`);
        if(response.data.status != 404) {
          //Index already exist, display toast
          return
        }

        var elements = document.getElementsByClassName('euiSelect');
        const properties = createMapping(elements, this.props.header);
        const resMap = await axios.post(`../api/xlsx_import/${this.props.indexName}/_mapping/doc`, JSON.parse(properties));
      }

      var bulk = createBulk(json, this.props.indexName);
      bulk.forEach(async(split_bulk) => {
        const response = await axios.post(`../api/xlsx_import/${this.props.indexName}/doc/_bulk`, split_bulk);
      })

      this.props.nextStep(this.props.indexName, json.length);

    } catch (error) {
        console.log(error);
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
              <EuiSwitch label="Use your own mapping?" value={this.state.switchMap.value} onChange={this.switchChange}/>
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
