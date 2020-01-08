import React, { useState } from 'react'
import {
  EuiBasicTable,
  EuiSelect,
  EuiTextArea
} from '@elastic/eui'

export function getMappingByColumns(columns) {

  let nbJsonInvalid = 0

  // get the initial items list and convert it to a mapping properties content
  let mappingObj = columns.reduce(function(acc, cur, i) {

    if (cur.isJsonInvalid) {
      nbJsonInvalid++
      return acc
    }

    acc[cur.name] = { 
      type: cur.type || "text", // default value "text" if no type
      ...cur.json
    } 
    return acc
  }, {});

  if (nbJsonInvalid > 0) {
    return false
  }

  return mappingObj
}

const MappingTable = ({ items, onChangeColumns }) => {

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

  // specific process to parse JSON and detect potential syntax error
  const handlePropertyJsonChange = (item, updatedContent) => {

    let parsedContent = updatedContent.json
    try {
      if (parsedContent) {
        parsedContent = {
          json: JSON.parse(parsedContent),
          isJsonInvalid: false
        }
      }
    }
    catch (err) {
      parsedContent = {
        json: parsedContent,
        isJsonInvalid: true
      }

    }
    
    // update the given item with new type or advanced json content
    handlePropertyChange(item, parsedContent)
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
    field: 'json',
    name: 'Advanced JSON',
    render: (name, item) => (
      <EuiTextArea
        className="advjsontext"
        isInvalid={item.isJsonInvalid}
        rows={4}
        placeholder={`{
  "type": "${item.type}",
  ...
}`}
        onChange={(e) => { handlePropertyJsonChange(item.name, {json: e.target.value})} } />
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
