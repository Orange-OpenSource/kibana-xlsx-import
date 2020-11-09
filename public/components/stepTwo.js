import React, {
  Component, Fragment
} from 'react'

import {
  EuiSwitch,
  EuiAccordion,
  EuiButton,
  EuiButtonEmpty,
  EuiComboBox,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiFormHelpText,
  EuiGlobalToastList,
  EuiIconTip,
  EuiImage,
  EuiLink,
  EuiPanel,
  EuiProgress,
  EuiSpacer,
} from '@elastic/eui'


import moment from 'moment-timezone'

import MappingTable, { getMappingByColumns } from './mappingTable.js'

import axios from 'axios'
import XLSX from 'xlsx'

import {
  createBulk,
  createKbnCustomId,
  getUID
} from '../services/services.js';
import {setESIndexName, formatJSON} from '../services/sheetServices.js';
//import { Http2ServerRequest } from 'http2'

class StepTwo extends Component {

  constructor(props) {
    
    super(props);
    this.firstRow = {
      ...this.props.firstRow,
      _line: "1337",
      _uid: getUID()
    }
    
    /*const resIndex = await axios.post('/api/kibana_xlsx_import/cluster/_health');
    this.props.http.get('/api/kibana_xlsx_import/cluster/_health').then(res => {
      //setTimestamp(res.time);
      // Use the core notifications service to display a success message.
      this.props.notifications.toasts.addSuccess(i18n.translate('myPluginName.dataUpdated', {
        defaultMessage: 'Data updated',
      }));
    });
    this.props.http.get('/api/kibana_xlsx_import/cat/indices').then(res => {
      //setTimestamp(res.time);
      // Use the core notifications service to display a success message.
      this.props.notifications.toasts.addSuccess(i18n.translate('myPluginName.dataUpdated', {
        defaultMessage: 'Data updated',
      }));
    });*/
   /* const requestOptions = {
      //method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer my-token',
          'My-Custom-Header': 'foobar'
      },
      params: {'name': 'index'},
      body: { output: 'React POST Request Example' }
      //query: {'query':'match_all{}'},     
  };
    this.props.http.post('/api/kibana_xlsx_import/create/indice/gigi',requestOptions).then(res => {
      //setTimestamp(res.time);
      // Use the core notifications service to display a success message.
      this.props.notifications.toasts.addSuccess(i18n.translate('myPluginName.dataUpdated', {
        defaultMessage: 'Data updated',
      }));
    });
    axios.post(`http://localhost:5603/buw/api/kibana_xlsx_import/create/indice/gugu`,requestOptions).then(res => {
      //setTimestamp(res.time);
      // Use the core notifications service to display a success message.
      this.props.notifications.toasts.addSuccess(i18n.translate('myPluginName.dataUpdated', {
        defaultMessage: 'Data updated',
      }));
    });*/
    this.anonOptions = this.props.columns.map((c) => ({label: c.name}))

    this.tzOptions = moment.tz.names().map(tz => ({label: tz}))

    this.state = {
      indexName: setESIndexName(this.props.fileName) + '_' + setESIndexName(this.props.sheetName),
      indexNameError: false,
      networkError: false,
      selectedAnonOptions: [],
      selectedTzOption: [{ label: moment.tz.guess() }],
      kbnId: {
        model: "line{_line}-{_uid}",
        preview: createKbnCustomId("line{_line}-{_uid}", this.firstRow)
      },
      uploadButton: {
        text : "Import",
        loading: false
      },
      customColumns: this.props.columns,
      enableCustomColumns: false,
      pipeline: "",
      enablePipeline: false,
      progress:{
        show: false,
        current: 0,
        color: "secondary"
      },
      toasts: []
    };

    this.indexNameChange        = this.indexNameChange.bind(this);
    this.kbnIdChange            = this.kbnIdChange.bind(this);
    this.onChangeAnonColumns    = this.onChangeAnonColumns.bind(this);
    this.onToggleCustomColumns  = this.onToggleCustomColumns.bind(this);
    this.onTogglePipeline       = this.onTogglePipeline.bind(this);
    this.onChangeColumns        = this.onChangeColumns.bind(this);
    this.onChangePipeline       = this.onChangePipeline.bind(this);
    this.onChangeTimezone             = this.onChangeTimezone.bind(this);
    this.handleClick            = this.handleClick.bind(this);
    this.handleNextStep         = this.handleNextStep.bind(this);
    this.backClick              = this.backClick.bind(this);
    this.addErrorToast          = this.addErrorToast.bind(this);
    this.addMappingToast        = this.addMappingToast.bind(this);
    this.removeToast            = this.removeToast.bind(this);
    this.getFilteredColumns     = this.getFilteredColumns.bind(this);
    this.http = this.props.http;
    
    axios.defaults.headers.post['kbn-xsrf'] = "reporting";
    axios.defaults.headers.delete['kbn-xsrf'] = "reporting";
  }

  // Return the anonymised-filtered items list
  getFilteredColumns() {
    return this.state.customColumns.filter(column => (!this.state.selectedAnonOptions.map(a => a.label).includes(column.name)))
  }

  indexNameChange(e) {
    if(/[~`!#$%\^&*+=\\[\]\\';,/{}|\\":<>\?]/g.test(e.target.value) || (/[A-Z]/.test(e.target.value)))
      this.setState({indexName: e.target.value, indexNameError: true});
    else {
      this.setState({indexName: e.target.value, indexNameError: false});
    }
  }

  kbnIdChange(e) {

    this.setState({
      kbnId: {
        model: e.target.value, 
        preview: createKbnCustomId(e.target.value, this.firstRow)}
      });
  }

  onChangeAnonColumns(e) {
    this.setState({ selectedAnonOptions: e });
  }

  onChangeTimezone(e) {
    this.setState({ selectedTzOption: e });
  }

  onToggleCustomColumns(e) {
    this.setState({enableCustomColumns: e.target.checked});
  }

  onTogglePipeline(e) {
    this.setState({enablePipeline: e.target.checked});
  }

  onChangeColumns(columns) {
    this.setState({customColumns: columns});
  }

  onChangePipeline(e) {
    this.setState({pipeline: e.target.value});
  }

  handleClick(e){
    this.setState({progress:{show: true, current:0, color: "secondary"}});
    this.handleNextStep();
  }

  async handleNextStep() {

    try {
     
      this.setState({uploadButton:{text:"Initializing index...", loading:true}});
      //const body = JSON.encoder.convert({indexName:this.state.indexName});
      const requestOptions = {
        //method: 'POST',
        params: {'name': 'index'},
        body: 'foo=bar&lorem=ipsum',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-token',
            'My-Custom-Header': 'foobar'
        },
        
        
        //query: {'query':'match_all{}'},     
    };
    let customMapping = getMappingByColumns(this.state.customColumns)
      //const resIndex = await axios.post(`http://localhost:5603/buw/api/kibana_xlsx_import/create/indice/${this.state.indexName}`,customMapping);
      this.props.http.post(`/api/kibana_xlsx_import/create/indice/${this.state.indexName}`,requestOptions).then(res => {
        //setTimestamp(res.time);
        // Use the core notifications service to display a success message.
        this.props.notifications.toasts.addSuccess(i18n.translate('myPluginName.dataUpdated', {
          defaultMessage: 'Data updated',
        }));
      });
      if (this.state.enableCustomColumns) {
        console.log("creating index", this.state.indexName)
        const resIndex = await axios.post(`../api/kibana-xlsx-import/${this.state.indexName}`);
        //const resIndex = await axios.post(`/api/kibana_xlsx_import/create/indice`);
        console.log(resIndex.data)
        if(resIndex.data.error != undefined) {
          throw {
            message: resIndex.data.error.msg, 
            tips: "Unable to create the index.",
            skipDelete: true // index probably already exists. don't delete it
          } 
        }

        console.log("applying mapping")
        let customMapping = getMappingByColumns(this.state.customColumns)
        if (customMapping === false) {
          throw {
            message: "Invalid JSON syntax in your mapping.",
            tips: "Unable to applying the mapping. Check your configuration."
          }
        }
        const resMap = await axios.post(`../api/kibana-xlsx-import/${this.state.indexName}/_mapping`, customMapping);
        if (resMap.data.error != undefined) {
          throw {
            message: resMap.data.error.msg,
            tips: "Unable to applying the mapping. Check your configuration."
          }
        }
      }

      this.setState({uploadButton:{text:"Reading data...", loading:true}});

      const tz = this.state.selectedTzOption[0].label
      const ws = this.props.workbook.Sheets[this.props.sheetName];
      const json = formatJSON(XLSX.utils.sheet_to_json(ws, {
        raw: false,
        dateNF:'YYYY-MM-DD"T"HH:MM:SS'
      }), this.state.customColumns, tz);

      if (this.state.selectedAnonOptions.length > 0) {
        console.log("filtering anonymised fields from json ...")
        const filter = this.state.selectedAnonOptions.map(s => s.label);
        json.map((j) => (
          filter.forEach(e => delete j[e])
        ));
      }

      var bulk = createBulk(
        json, 
        this.state.indexName, 
        this.state.kbnId.model,
        this.props.bulksize 
      );

      console.log("sending documents to", this.state.indexName)
      this.setState({uploadButton:{text:"Importing data...", loading: true}});
      
      let bulkPath = `../api/kibana-xlsx-import/${this.state.indexName}/_bulk`
      if (this.state.enablePipeline && this.state.pipeline) {
        bulkPath += "?pipeline=" + this.state.pipeline
      }

      for(var i = 0; i < bulk.length; i++ ) {
        this.setState({progress:{current: (i/bulk.length)*100}});
        
        const response = await axios.post(bulkPath, bulk[i]);
        
          if (response.data.errors) {

            const invalidItems = response.data.items    // parse all items
              .map((item) => ({                          
                ...item, 
                isInvalid: item.index.status < 200 || item.index.status >= 300 }) // is the status in error ?
              )
              .filter((item) => item.isInvalid)         // filter only the error

            throw {
              reason: "Some lines are invalid according to the mapping index. The import will be aborted. Check browser console for full errors list",
              items: invalidItems,
              fullstack: invalidItems
            }
          }
          else if (response.data.error) {
            this.setState({networkError : true});
            throw{
              reason: response.data.error.message,
              fullstack: response.data.error
            }
          }
          else if(i === bulk.length - 1){
            break;
          }
      }

      // finally call the next step
      this.props.nextStep(this.state.indexName, this.props.sheetName, this.props.fileName, json.length)

    } catch (err) {

      if (err.items) {
          
        err.items.slice(0, 5).forEach(item => {
          // reason for first 5 errors
          let optionalCausedBy = item.index.error && item.index.error.caused_by && item.index.error.caused_by.reason
          this.addErrorToast(item.index.error.reason, optionalCausedBy)
        })   
        if (err.items.length > 5) {
          this.addErrorToast(err.reason)
        }
      }
      else if (!err.skipToast) {
        this.addErrorToast(err.message || "Something wrong happened, check browser console for more information", err.tips || false);
      }
    
      console.log(err.fullstack)

      if (!err.skipDelete) {
        axios.delete(`../api/kibana-xlsx-import/${this.state.indexName}`);
      }
      this.setState({ 
        uploadButton: { text:"Import", loading:false }, 
        progress: { show: false, color: "danger" 
      }});
    }
  };

  backClick(e) {
    window.location.reload();
  }

  addErrorToast = (msg, optionalTips = false) => {
    const toast = {
      id: getUID(),
      title: "Couldn't complete the import",
      color: "danger",
      iconType: "alert",
      text: (
        <Fragment>
          <p>
            {msg}
          </p>
          { optionalTips && (
            <p style={{fontWeight:'bold'}}>
              {optionalTips}
            </p>
          )}
        </Fragment>
      ),
    }

    this.setState({
      toasts: this.state.toasts.concat(toast),
    });
  };

  addMappingToast = () => {
    const toast = {
      id: getUID(),
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

    let mappingTooltipContent = (
      <Fragment>
        <p>
          Mapping is the process of defining how a document, and the fields it contains, are stored and indexed. <br/>
          Fields and mapping types do not need to be defined before being used. <br/>
          You know more about your data than Elasticsearch can guess, so while dynamic mapping can be useful to get started, 
          at some point you will want to specify your own explicit mappings.<br/>
          For instance, use mappings to define:
        </p>

        <ul>
          <li>- which string fields should be treated as full text fields.</li>
          <li>- which fields contain numbers, dates, or geolocations.</li>
          <li>- the format of date values.</li>
          <li>- custom rules to control the mapping for dynamically added fields.</li>
        </ul>

        <p>See Mapping API section on elastic.co</p>

      </Fragment>
    )

    let pipelineTooltipContent = (
      <Fragment>
        <p>
          To pre-process documents before indexing, define a pipeline that specifies a series of processors. <br/>
          Each processor tranforms the document in some specific way.<br/>
          For example, a pipeline might have one processor that concatenate two fields from the document, 
          followed by another processor that renames a field.
        </p>
        <p>See Pipeline API section on elastic.co</p>
        

      </Fragment>
    )

    return (
      <Fragment>
          <EuiForm>
            <EuiFormRow 
              isInvalid={this.state.indexNameError} 
              label="Index name" 
              error={errors}
              helpText={"Name the elasticsearch index that will be created. If the index is already existing, " +
                        "documents will be added or updated according to the chosen docID"}
            >
              <EuiFieldText isInvalid={this.state.indexNameError} id="indexName" value={this.state.indexName} onChange={this.indexNameChange}/>
            </EuiFormRow>

            <EuiFormRow
            label="Custom docID"
            helpText={"Import will provide a unique document identifier linked to the line number " + 
                      "of the imported file. You can customize this doc ID using special reserved variables : " +
                      "{_uid} for an auto-generated identifier, {_importedLine} for the current line number, " +
                      "or {<column-name>} to access a value of the imported line."}
            >
              <EuiFlexGroup gutterSize="s" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiFieldText id="kbnID" value={this.state.kbnId.model} onChange={this.kbnIdChange}/>
                </EuiFlexItem>

                <EuiFlexItem grow={false}>
                  <span style={{fontSize: "x-small", margin: "-10px auto 2px 12px"}}>example rendering</span>
                  <EuiFieldText id="previewKbnID" placeholder="Custom ID preview" value={this.state.kbnId.preview} readOnly/>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFormRow>

            <EuiFormRow 
              label="Removing columns"
              helpText={"Select the columns you want to remove from the import."}
            >
                  <EuiComboBox
                    options={this.anonOptions}
                    selectedOptions={this.state.selectedAnonOptions}
                    onChange={this.onChangeAnonColumns} />
            </EuiFormRow>

            <EuiFormRow 
              label="Choose your timezone"
              helpText={"Excel does not manage timezone within date format cells. Define your file content timezone to index its date fields in a correct way."}
            >
              <EuiComboBox
                singleSelection={{ asPlainText: true }}
                options={this.tzOptions}
                selectedOptions={this.state.selectedTzOption}
                onChange={this.onChangeTimezone}
                isClearable={false}
              />
            </EuiFormRow>

            <EuiSpacer size="s" />

            <EuiFormRow fullWidth={true}>
              
              <span>
                <EuiSwitch label="Configure your own mapping" 
                  checked={this.state.enableCustomColumns} 
                  onChange={this.onToggleCustomColumns}
                />
                &nbsp;
                <EuiIconTip
                  aria-label="Info about mapping"
                  position="right"
                  content={mappingTooltipContent}
                />
              </span>

            </EuiFormRow>

            { this.state.enableCustomColumns && (
              <Fragment>
                <MappingTable items={this.getFilteredColumns()} onChangeColumns={this.onChangeColumns}/>
                <EuiSpacer size="m" />
              </Fragment>
            )}

            <EuiFormRow fullWidth={true}>
              
              <span>
                <EuiSwitch label="Add ingest pipeline ids" 
                  checked={this.state.enablePipeline} 
                  onChange={this.onTogglePipeline}
                />
                &nbsp;
                <EuiIconTip
                  aria-label="Info about pipeline"
                  position="right"
                  content={pipelineTooltipContent}
                />
              </span>

            </EuiFormRow>

            { this.state.enablePipeline &&
              <EuiFormRow 
              label="Set pipeline ids"
              helpText={"The pipeline ids to preprocess incoming documents with, comma separated list."}
            >
              <EuiFieldText
                placeholder="pipeline1,pipeline2"
                defaultValue={this.state.pipeline}
                onChange={this.onChangePipeline}
                aria-label="The pipeline ids to preprocess incoming documents with, comma separated list"
              />
            </EuiFormRow>
            }

            <EuiSpacer size="m" />

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
              toastLifeTimeMs={15000}
            />
          </EuiForm>
          <EuiSpacer size="m" />
          <EuiProgress value={this.state.progress.current} max={100} color={this.state.progress.color} size="s" />
      </Fragment>
    );
  }
}

export default StepTwo
