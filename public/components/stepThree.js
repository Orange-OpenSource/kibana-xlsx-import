import React, {Component} from 'react';
import {
  EuiCallOut,
  EuiSpacer,
  EuiButtonEmpty,
  EuiForm,
  EuiFormRow,
  EuiFlexItem,
  EuiFlexGroup
} from '@elastic/eui';

class StepThree extends Component {
  constructor(props) {
    super(props);
  }

  handleClick = () => {
    window.location.reload();
  }

  render() {    
    return (
      <EuiForm>
        <EuiFormRow>
          <EuiCallOut
            title= "Your file have been imported !"
            color="success"
            iconType="check">
              <EuiSpacer size="s"/>
              <p>{this.props.nbDocument} document(s) have been imported into {this.props.indexName}.</p>
              <p>File name : {this.props.fileName}</p>
              <p>Sheet name : {this.props.sheetName}</p>
          </EuiCallOut>
        </EuiFormRow>
        <EuiFormRow>
          <EuiFlexGroup gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={this.handleClick} size="s" iconType="arrowRight">
                Import a new file
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>
      </EuiForm>
    );
  }
}

export default StepThree
