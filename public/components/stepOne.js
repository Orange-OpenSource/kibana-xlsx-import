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
  EuiLoadingKibana,
  EuiSelect,
  EuiPanel,
  EuiImage,
} from '@elastic/eui';

import PreviewTable from './previewTable.js';

import XLSX from 'xlsx';

import {
  get_header_row,
  formatJSON,
  getExtension,
  setESIndexName
} from '../services/sheetServices.js';


class StepOne extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workbook: {},
      filename: "",
      sheetname: "",
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

        if(getExtension(this.state.filename)[0] != "csv"){
          var wb = await XLSX.read(reader.result, {type : 'array'});
        } else {
          var wb = await XLSX.read(reader.result, {type : 'binary'});
        }

        var options = wb.SheetNames.map((s) => ({
          value: s,
          text: s
        }));
        this.setState({workbook: wb, selectItem:{options: this.state.selectItem.options.concat(options)}, loading: false});
      };

      if(getExtension(file[0].name)[0] != "csv")
        reader.readAsArrayBuffer(file[0]);
      else {
        reader.readAsText(file[0]);
      };
      this.setState({filename: file[0].name});
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
    this.setState({data:{loaded: false}, sheetname: item.target.value});

    if(item.target.value === "") {
      this.setState({data:{loaded: true, items: [], columns: []}, disableButton: true});
      return
    }

    if(this.state.workbook.Sheets[item.target.value]['!ref'] != undefined) {
      let range = XLSX.utils.decode_range(this.state.workbook.Sheets[item.target.value]['!ref']);
      if(range.e.r > 5) range.e.r = 5; //TODO : use config instead

      let columns = get_header_row(this.state.workbook.Sheets[item.target.value]).map((s) => ({
        field: s,
        name: s,
        truncateText: true
      }));

      let items = await formatJSON(XLSX.utils.sheet_to_json(this.state.workbook.Sheets[item.target.value], {range: range}));
      this.setState({data:{loaded: true, items: items, columns: columns}, disableButton: false});
    }
    else {
      this.setState({data:{loaded: true, items: [], columns: []}, disableButton: true});
    }
  };

  onNextClick(e) {
    this.props.nextStep(this.state.filename, this.state.workbook, this.state.sheetname, this.state.data.items[0]);
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
          columns={this.state.data.columns} />
      );
    }

    if(this.state.loading) {
      renderLoading = (
        <EuiFlexGroup justifyContent="spaceAround">
          <EuiFlexItem grow={false}>
            <EuiLoadingKibana size="xl"/>
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

        {previewTable}

      </Fragment>
    );
  }
}

export default StepOne
