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
  EuiSelect
} from '@elastic/eui';


class StepOne extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: {},
    };
  }

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
              <input import-sheet-js class="form-control-file" type="file" id="file" />
            </EuiFormRow>

            <EuiFormRow label="Select the sheet to import">
              <EuiSelect options={[]} disabled/>
            </EuiFormRow>

          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton iconType="arrowRight" disabled>Next</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  }
}

export default StepOne
