import React, { useState } from 'react'
import {
  EuiBasicTable,
  EuiSelect,
  EuiTextArea
} from '@elastic/eui'

export function getInitialMapping(items) {

  // get the initial items list and convert it to a mapping properties content
  let initialMappingObj = items.reduce(function(acc, cur, i) {
    acc[cur.name] = { type: cur.type || "text" } // default value "text" if no type
    return acc;
  }, {});

  return initialMappingObj
}

const MappingTable = ({ items, onChangeColumns }) => {

  // get the initial items list and convert it to a mapping properties object
  //let initialMappingObj = getInitialMapping(items)

  const [mappingArr, setMappingArr] = useState(items); 

  const handlePropertyChange = (item, updatedContent) => {

    // update the given item with new type or advanced json content
    const newMappingArr = mappingArr.map(i => {
      if (i.name !== item) {
        return i
      }

      return {
        ...i,
        ...updatedContent
      }

    })

    setMappingArr(newMappingArr)

    onChangeColumns(newMappingArr)
  }

  const options = [
      { value: 'text', text: 'Text'},
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
    render: (name, item) => (
      <EuiSelect options={options} defaultValue={name} onChange={(e) => { handlePropertyChange(item.name, {type: e.target.value})} }/>
    )
  }, {
    field: 'advjson',
    name: 'Advanced JSON',
    render: (name, item) => (
      <EuiTextArea
        className="advjsontext"
        rows={4}
        placeholder='{fielddata": true, "format": "yyyy/MM/dd", ...}'
        onChange={(e) => { handlePropertyChange(item.name, e.target.value ? JSON.parse(e.target.value) : "")} } />
    )
  }];

  return (
    <EuiBasicTable
      items={mappingArr}
      columns={columns}
    />
  );
};

export default MappingTable
