import React, {
  Component, Fragment
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
  EuiLink,
  EuiProgress,
  EuiPanel,
  EuiImage,
  EuiComboBox
} from '@elastic/eui';

import MappingTable from './mappingTable.js';

import axios from 'axios';
import XLSX from 'xlsx';

import {
  createBulk,
  createMapping,
  createKbnCustomId
} from '../services/services.js';
import {setESIndexName, formatJSON} from '../services/sheetServices.js';

class StepTwo extends Component {

  constructor(props) {
    super(props);

    this.state = {
      indexName: setESIndexName(this.props.indexName),
      indexNameError: false,
      networkError: false,
      options: [],
      selectedAnonOptions: [],
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
      progress:{
        show: false,
        current: 0,
        color: "secondary"
      },
      toasts: []
    };

    this.indexNameChange = this.indexNameChange.bind(this);
    this.kbnIdChange = this.kbnIdChange.bind(this);
    this.onChangeAnonColumns = this.onChangeAnonColumns.bind(this);
    this.switchChange = this.switchChange.bind(this);
    this.onChangeMapping = this.onChangeMapping.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleNextStep = this.handleNextStep.bind(this);
    this.backClick = this.backClick.bind(this);
    this.addErrorToast = this.addErrorToast.bind(this);
    this.addMappingToast = this.addMappingToast.bind(this);
    this.removeToast = this.removeToast.bind(this);

    axios.defaults.headers.post['kbn-xsrf'] = "reporting";
    axios.defaults.headers.delete['kbn-xsrf'] = "reporting";
  }

  componentDidMount() {
    const opt = this.props.header.map((s) => ({
        label: s
    }));
    this.setState({ options: opt });
  }

  indexNameChange(e) {
    if(/[~`!#$%\^&*+=\\[\]\\';,/{}|\\":<>\?]/g.test(e.target.value) || (/[A-Z]/.test(e.target.value)))
      this.setState({indexName: e.target.value, indexNameError: true});
    else {
      this.setState({indexName: e.target.value, indexNameError: false});
    }
  }

  kbnIdChange(e) {
    this.setState({kbnId:{model: e.target.value, preview: createKbnCustomId(e.target.value, this.props.firstRow)}});
  }

  onChangeAnonColumns(e) {
    this.setState({ selectedAnonOptions: e });
  }

  switchChange(e) {
    this.setState({switchMap:{value: e.target.checked}});
  }

  onChangeMapping() {
    if(!this.state.switchMap.value) {
        this.setState({switchMap:{value: true}});
        this.addMappingToast();
    }
  }

  handleClick(e){
    this.setState({progress:{show: true, current:0, color: "secondary"}});
    this.handleNextStep();
  }

  async handleNextStep() {
    var ws = this.props.workbook.Sheets[this.props.sheetname];

    try {
      const json = formatJSON(XLSX.utils.sheet_to_json(ws));

      /*if(this.state.networkError) {
        console.log("deleting index after lost connection...")
        await axios.delete(`../api/xlsx_import/${this.state.indexName}`);
      }*/
      if(this.state.selectedAnonOptions.length > 0) {
        console.log("filtering json...")
        const filter = this.state.selectedAnonOptions.map((s) => (
            s.label
        ));
        const filteredJson = json.map((j) => (
          filter.forEach(e => delete j[e])
        ));
      }

      if(this.state.switchMap.value) {
        console.log("creating index", this.state.indexName)
        const resIndex = await axios.post(`../api/xlsx_import/${this.state.indexName}`);
        if(resIndex.data.error != undefined) {
          this.addErrorToast(resIndex.data.error.msg);
          return
        }

        console.log("applying mapping")
        var elements = document.getElementsByClassName('euiSelect');
        var mappingParameters = document.getElementsByClassName('advjsontext');
        const properties = createMapping(elements, mappingParameters, this.props.header);
        const resMap = await axios.post(`../api/xlsx_import/${this.state.indexName}/_mapping/doc`, properties);
        if(resMap.data.error != undefined) {
          this.addErrorToast(resMap.data.error.msg);
          axios.delete(`../api/xlsx_import/${this.state.indexName}`);
          return
        }
      }

      var bulk = createBulk(json, this.state.indexName, this.state.kbnId.model, this.props.bulksize);

      var request = new Promise(async(resolve, reject) => {
        console.log("sending documents to", this.state.indexName)
        this.setState({uploadButton:{text:"Loading...", loading:true}});
        for(var i = 0; i < bulk.length; i++ ) {
          this.setState({progress:{current: (i/bulk.length)*100}});
          const response = await axios.post(`../api/xlsx_import/${this.state.indexName}/doc/_bulk`, bulk[i]);
          try {
            if(response.data.errors) {
              reject(response.data.items[i].index.error.reason + " " +
                response.data.items[i].index.error.caused_by.reason);
              return
            }
            else if(response.data.error != undefined) {
              this.setState({networkError : true});
              reject(response.data.error.message);
              return
            }
            else if(i === bulk.length -1){
              resolve();
            }
          } catch (error) {
            reject("Something wrong happened, check your advanced JSON");
          }
        }
      });

      request.then(() => {
        this.props.nextStep(this.state.indexName, this.props.sheetname, this.props.indexName ,json.length);
      },(reason) => {
        this.addErrorToast(reason);
        axios.delete(`../api/xlsx_import/${this.state.indexName}`);
        this.setState({uploadButton:{text:"Import", loading:false}, progress:{show: false, color: "danger"}});
      });

    } catch (error) {
        axios.delete(`../api/xlsx_import/${this.state.indexName}`);
        this.addErrorToast(error.message, "Verify your advanced JSON or your fields name");
    }
  };


  backClick(e) {
    window.location.reload();
  }

  addErrorToast = (msg) => {
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

  addMappingToast = () => {
    const toast = {
      title: "Mapping change detected",
      text: (
        <p>
          Custom mapping enable.
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

    let progressBar = null;

    if(this.state.progress.show) {
      progressBar = (
        <EuiProgress value={this.state.progress.current} max={100} color="secondary" size="s" />
      );
    }

    return (
      <Fragment>
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

            <EuiFormRow label="Removing columns">
                  <EuiComboBox
                    options={this.state.options}
                    selectedOptions={this.state.selectedAnonOptions}
                    onChange={this.onChangeAnonColumns} />
            </EuiFormRow>

            <EuiSpacer size="s" />

            <EuiFormRow fullWidth={true}>
              <EuiAccordion id="mapping" buttonContent="Configure mapping">

                <EuiSpacer size="m" />

                <EuiFormRow>
                  <EuiSwitch label="Use your own mapping?" checked={this.state.switchMap.value} onChange={this.switchChange}/>
                </EuiFormRow>

                <MappingTable items={this.props.items} onChangeMapping={this.onChangeMapping}/>
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
          <EuiSpacer size="m" />
          <EuiProgress value={this.state.progress.current} max={100} color={this.state.progress.color} size="s" />
      </Fragment>
    );
  }
}

export default StepTwo
