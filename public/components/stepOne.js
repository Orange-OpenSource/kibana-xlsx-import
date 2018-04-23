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
  EuiSelect
} from '@elastic/eui';

import XLSX from 'xlsx';


class StepOne extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workbook: {},
      selectItem: {
        options: [{}],
        disabled: true
      },
    };
  }

  onChange = (file) => {
    var reader = new FileReader();
    reader.onload = async (file) => {
      var wb = await XLSX.read(reader.result, {type : 'array'});
      var options = wb.SheetNames.map((s) => ({
        value: s,
        text: s
      }));
      this.setState({workbook: wb, selectItem:{options: this.state.selectItem.options.concat(options), disabled: false} });

    };
    reader.readAsArrayBuffer(file.target.files[0]);
  };

  selectChange = (item) => {
    console.log(item)
  };

  render() {
    const items = [];
    const columns = [];

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
              <input type="file" onChange={file => { this.onChange(file); }}/>
            </EuiFormRow>

            <EuiFormRow label="Select the sheet to import">
              <EuiSelect
                options={this.state.selectItem.options}
                disabled={this.state.selectItem.disabled}
                onChange={item => { this.selectChange(item); }} />
            </EuiFormRow>

          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton iconType="arrowRight" disabled>Next</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexGroup justifyContent="spaceAround">
          <EuiFlexItem grow={false}>
            <EuiLoadingKibana size="xl"/>
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  }
}

export default StepOne
