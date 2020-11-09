import React, {
  Component, Fragment
} from 'react';

import ReactDOM from 'react-dom';

import {
  EuiForm,
  EuiFormRow,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFilePicker,
  EuiTitle,
  EuiSpacer,
  EuiButton,
  EuiLoadingSpinner,
  EuiSelect,
  EuiPanel,
  EuiImage,
} from '@elastic/eui';

import PreviewTable from './previewTable.js';

import XLSX from 'xlsx';

import {
  getHeaderRowWithType,
  formatJSON,
  getExtension,
  setESIndexName
} from '../services/sheetServices.js';


class StepOne extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workbook: {},
      fileName: "",
      sheetName: "",
      selectItem: {
        options: [{value: "", text: ""}]
      },
      data: {
        loaded: false,
        items: [],
        columns: []
      },
      disableButton: true,
      loading: false
    };
  }
  
  onFileChange = (file) => {
    if(file.length > 0) {
      //UI reset
      this.setState({
        selectItem:{options: [{value: "", text: ""}]},
        data:{loaded: false, items: [], columns: []},
        disableButton: true,
        loading: true,
      });
      
      var reader = new FileReader();
      reader.onload = async (file) => {

        if(getExtension(this.state.fileName)[0] != "csv"){
          var wb = await XLSX.read(reader.result, {type : 'array', cellDates: true, cellNF:false, cellText:false});
        } else {
          var wb = await XLSX.read(reader.result, {type : 'binary'});
        }

        var options = wb.SheetNames.map((s) => ({
          value: s,
          text: s
        }));
        this.setState({
          workbook: wb, 
          selectItem: { options }, 
          loading: false
        });

        this.changeSheet(options[0].value)
      };
      
      if(getExtension(file[0].name)[0] != "csv")
        reader.readAsArrayBuffer(file[0]);
      else {
        reader.readAsText(file[0]);
      };
      
      this.setState({fileName: file[0].name});
    }
    else {
      this.setState({
        selectItem:{options: [{value: "", text: ""}]},
        data:{loaded: false, items: [], columns: []},
        disableButton: true,
        workbook: {}
      });
    }
  };

  async onSheetChange(item) {
    this.changeSheet(item.target.value)
  }

  changeSheet(item) {
    this.setState({data:{loaded: false}, sheetName: item});

    if(item === "") {
      this.setState({data:{loaded: true, items: [], columns: []}, disableButton: true});
      return
    }

    if(this.state.workbook.Sheets[item]['!ref'] != undefined) {
      let range = XLSX.utils.decode_range(this.state.workbook.Sheets[item]['!ref']);
      if(range.e.r > 5) range.e.r = 5; //TODO : use config instead

      let columns = getHeaderRowWithType(this.state.workbook.Sheets[item]);

      let items = formatJSON(XLSX.utils.sheet_to_json(this.state.workbook.Sheets[item], {
        range: range,
        raw: false,
        dateNF:'YYYY-MM-DD"T"HH:MM:SS'
      }), columns);
      this.setState({data:{loaded: true, items: items, columns: columns}, disableButton: false});

    }
    else {
      this.setState({data:{loaded: true, items: [], columns: []}, disableButton: true});
    }
  };

  onNextClick(e) {
    this.props.nextStep(this.state.fileName, this.state.sheetName, this.state.workbook, this.state.data.items[0], this.state.data.columns);
  }

  render() {
    let sheetDisabled = true;
    let previewTable = null;
    let renderLoading = null;

    if(!(Object.keys(this.state.workbook).length === 0 && this.state.workbook.constructor === Object))
      sheetDisabled = false

    if(this.state.data.loaded) {
      previewTable = (
        <PreviewTable
          items={this.state.data.items}
          columns={this.state.data.columns.map((c) => ({
            field: c.name,
            name: c.name,
            truncateText: true
          }))} />
      );
    }

    if(this.state.loading) {
      renderLoading = (
        <EuiFlexGroup justifyContent="spaceAround">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner size="xl"/>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    }

    return(
      <Fragment>
        <EuiFlexGroup gutterSize="l">
          <EuiFlexItem grow={false}>
            <EuiFormRow>
              <EuiTitle size="s">
                <h1>Import your xlsx and csv file to ElasticSearch</h1>
              </EuiTitle>
            </EuiFormRow>

            <EuiFormRow>
              <EuiFilePicker
              id="asdf2"
              initialPromptText="Select or drag and drop file"
              onChange={file => { this.onFileChange(file); }}
              />
            </EuiFormRow>

            <EuiFormRow>
              <EuiFlexGroup gutterSize="l" alignItems="flexEnd" justifyContent="spaceBetween" style={{marginLeft: "0px"}}>
                <EuiFormRow label="Select the sheet to import">
                  <EuiFlexItem grow={false}>
                    <EuiSelect
                      options={this.state.selectItem.options}
                      disabled={sheetDisabled}
                      onChange={item => { this.onSheetChange(item); }} />
                  </EuiFlexItem>
                </EuiFormRow>
                <EuiFormRow>
                  <EuiFlexItem grow={false}>
                    <EuiButton
                      iconType="arrowRight"
                      disabled={this.state.disableButton}
                      onClick={e => { this.onNextClick(e); }}>
                        Next
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFormRow>
              </EuiFlexGroup>
            </EuiFormRow>

          </EuiFlexItem>

        </EuiFlexGroup>

        {renderLoading}

        <EuiSpacer size="l" />

        <EuiFlexGroup gutterSize="l">
          <EuiFlexItem grow={false}>
            {previewTable}
          </EuiFlexItem>
        </EuiFlexGroup>    

      </Fragment>
    );
  }
}

export default StepOne
