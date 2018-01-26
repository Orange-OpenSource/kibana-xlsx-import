import React from 'react';
import {Table, Column, Cell} from 'fixed-data-table-2';


class MyMapping extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    	myMappingData: this.props.data
    };
  }

  render() {

    return (
    <div>
      <Table
        rowsCount={this.state.myMappingData.length}
        rowHeight={80}
        headerHeight={50}
        width={500}
        height={(this.state.myMappingData.length) * 80 + 55}>
	    
	    <Column
      		header={<Cell>Fields</Cell>}
      		cell={props => (
  		 		<Cell {...props}>
  		 			{this.state.myMappingData[props.rowIndex]}
  		 		</Cell>
  		 	)}
      		width={300}
    	/>
   		<Column
      		header={<Cell>Type</Cell>}
      		cell={props => (
      			<Cell {...props}>
              <div className="form-group">
      			  <select className="form-control" id={this.state.myMappingData[props.rowIndex]}>
  						  <option value="text">text</option>
  						  <option value="keyword">keyword</option>
  						  <option value="integer">integer</option>
  						  <option value="short">short</option>
  						  <option value="long">long</option>
  						  <option value="byte">byte</option>
  						  <option value="double">double</option>
  						  <option value="float">float</option>
  						  <option value="date">date</option>
  						  <option value="boolean">boolean</option>
                <option value="geo_point">geo point</option>
					    </select>
              </div>
      			</Cell>
      		)}
      		width={200}
    	/>   
      </Table>
      <br />
    </div>
    );
  }
}

export default MyMapping;