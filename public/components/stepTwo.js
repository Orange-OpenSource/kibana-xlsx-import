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
  EuiButtonEmpty,
  EuiGlobalToastList,
  EuiFormHelpText,
  EuiLink
} from '@elastic/eui';

import MappingTable from './mappingTable.js';

import axios from 'axios';
import XLSX from 'xlsx';

import {
  createBulk,
  createMapping,
  createKbnCustomId
} from '../services/services.js';


class StepTwo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      indexName: this.props.indexName,
      indexNameError: false,
      bulkError: false,
      kbnId: {
        model: "",
        preview: ""
      },
      uploadButton: {
        text : "Import",
        loading: false
      },
      switchMap: {
        value: false
      },
      toasts: []
    };

    this.indexNameChange = this.indexNameChange.bind(this);
    this.kbnIdChange = this.kbnIdChange.bind(this);
    this.switchChange = this.switchChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleNextStep = this.handleNextStep.bind(this);
    this.backClick = this.backClick.bind(this);
    this.addToast = this.addToast.bind(this);
    this.removeToast = this.removeToast.bind(this);

    axios.defaults.headers.post['kbn-xsrf'] = "reporting";
    axios.defaults.headers.delete['kbn-xsrf'] = "reporting";
  }

  indexNameChange(e) {
    if(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(e.target.value) || (/[A-Z]/.test(e.target.value)))
      this.setState({indexName: e.target.value, indexNameError: true});
    else {
      this.setState({indexName: e.target.value, indexNameError: false});
    }
  }

  kbnIdChange(e) {
    this.setState({kbnId:{model: e.target.value, preview: createKbnCustomId(e.target.value, this.props.firstRow)}});
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
        const resIndex = await axios.post(`../api/xlsx_import/${this.state.indexName}`);
        if(resIndex.data.error != undefined) {
          this.addToast(resIndex.data.error.msg);
          return
        }

        var elements = document.getElementsByClassName('euiSelect');
        var mappingParameters = document.getElementsByClassName('advjsontext');
        const properties = createMapping(elements, mappingParameters, this.props.header);
        const resMap = await axios.post(`../api/xlsx_import/${this.state.indexName}/_mapping/doc`, JSON.parse(properties));
      }

      var bulk = createBulk(json, this.state.indexName, this.state.kbnId.model);
      bulk.forEach(async(split_bulk) => {
        const response = await axios.post(`../api/xlsx_import/${this.state.indexName}/doc/_bulk`, split_bulk);
        if(response.data.errors){
          this.addToast(response.data.items[0].index.error.reason + " " +
            response.data.items[0].index.error.caused_by.reason);
          axios.delete(`../api/xlsx_import/${this.state.indexName}`);
        } else {
          this.props.nextStep(this.state.indexName, json.length);
        }
      })

    } catch (error) {
        axios.delete(`../api/xlsx_import/${this.state.indexName}`);
        this.addToast(error.message);
    }
  };

  backClick(e) {
    window.location.reload();
  }

  addToast = (msg) => {
    const toast = {
      title: "Couldn't complete the import",
      color: "danger",
      iconType: "alert",
      text: (
        <p>
          {msg}
        </p>
      ),
    }

    this.setState({
      toasts: this.state.toasts.concat(toast),
    });
  };

  removeToast = (removedToast) => {
    this.setState(prevState => ({
      toasts: prevState.toasts.filter(toast => toast.id !== removedToast.id),
    }));
  };

  removeAllToasts = () => {
    this.setState({
      toasts: [],
    });
  };


  render() {
    const errors = [
      "Index name must be all lowercase and don't contains special characters"
    ];

    return (
      <EuiForm>
        <EuiFormRow isInvalid={this.state.indexNameError} label="Index name" error={errors}>
          <EuiFieldText isInvalid={this.state.indexNameError} id="indexName" value={this.state.indexName} onChange={this.indexNameChange}/>
        </EuiFormRow>

        <EuiFormRow
        label="Kibana custom ID"
        helpText="Kibana will provide a unique identifier for each index pattern. If you do not want to use this unique ID, enter a custom one.">
          <EuiFlexGroup gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiFieldText id="kbnID" value={this.state.kbnId.model} onChange={this.kbnIdChange}/>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiFieldText id="previewKbnID" placeholder="Custom ID preview" value={this.state.kbnId.preview} readOnly/>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>

        <EuiSpacer size="s" />

        <EuiFormRow fullWidth={true}>
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
              <EuiButton fill isDisabled={this.state.indexNameError} onClick={this.handleNextStep} iconType="importAction" isLoading={this.state.uploadButton.loading}>
                {this.state.uploadButton.text}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>

        <EuiGlobalToastList
          toasts={this.state.toasts}
          dismissToast={this.removeToast}
          toastLifeTimeMs={6000}
        />
      </EuiForm>
    );
  }
}

export default StepTwo
