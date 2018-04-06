import React from 'react';
import {EuiBasicTable} from '@elastic/eui';

const Table = (props) => {
  return (
    <EuiBasicTable
      items={props.items}
      columns={props.columns}
    />
  );
};

export default Table
