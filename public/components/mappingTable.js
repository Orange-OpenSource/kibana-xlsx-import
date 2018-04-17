import React from 'react';
import {
  EuiBasicTable,
  EuiSelect,
  EuiFieldText
} from '@elastic/eui';

const MappingTable = (props) => {

  const options = [
      { value: 'text', text: 'Text' },
      { value: 'keyword', text: 'Keyword' },
      { value: 'integer', text: 'Integer' },
      { value: 'short', text: 'Short' },
      { value: 'long', text: 'Long' },
      { value: 'double', text: 'Double' },
      { value: 'float', text: 'Float' },
      { value: 'date', text: 'Date' },
      { value: 'boolean', text: 'Boolean' },
      { value: 'byte', text: 'Byte' },
      { value: 'binary', text: 'Binary' },
      { value: 'ip', text: 'IP' },
      { value: 'geo_point', text: 'Geo Point' },
      { value: 'geo_shape', text: 'Geo Shape' },
    ];

  const columns = [{
    field: 'name',
    name: 'Fields'
  }, {
    field: 'type',
    name: 'Type',
    render: (name) => (
      <EuiSelect options={options} defaultValue={name}/>
    )
  }, {
    field: 'advjson',
    name: 'Advanced JSON',
    render: () => (
      <EuiFieldText className="advjsontext" placeholder='"fielddata": true, "format": "yyyy-MM-dd", ...' />
    )
  }];

  return (
    <EuiBasicTable
      items={props.items}
      columns={columns}
    />
  );
};

export default MappingTable
