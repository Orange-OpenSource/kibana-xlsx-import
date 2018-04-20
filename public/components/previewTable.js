import React from 'react';
import {EuiBasicTable} from '@elastic/eui';

const PreviewTable = (props) => {
  return (
    <EuiBasicTable
      items={props.items}
      columns={props.columns}
    />
  );
};

export default PreviewTable
