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

    if(getExtension(file.target.files[0].name)[0] != "csv")
      reader.readAsArrayBuffer(file.target.files[0]);
    else {
      reader.readAsText(file.target.files[0]);
    };
    this.setState({filename: file.target.files[0].name});
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
    let sheetSelector = null;
    let previewTable = null;
    let renderLoading = null;

    if(!(Object.keys(this.state.workbook).length === 0 && this.state.workbook.constructor === Object)) {
      sheetSelector = (
        <EuiFormRow label="Select the sheet to import">
          <EuiSelect
            options={this.state.selectItem.options}
            disabled={this.state.selectItem.disabled}
            onChange={item => { this.onSheetChange(item); }} />
        </EuiFormRow>
      );
    }

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
        <EuiFlexGroup gutterSize="l" alignItems="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiFormRow>
              <EuiTitle size="s">
                <h1>Import your xlsx and csv file to ElasticSearch</h1>
              </EuiTitle>
            </EuiFormRow>

            <EuiFormRow>
              <input type="file" onChange={file => { this.onFileChange(file); }}/>
            </EuiFormRow>

            {sheetSelector}

          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton
              iconType="arrowRight"
              disabled={this.state.disableButton}
              onClick={e => { this.onNextClick(e); }}>
                Next
            </EuiButton>
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
