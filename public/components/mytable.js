import React from 'react';
import {Table, Column, Cell} from 'fixed-data-table-2';


class MyTextCell extends React.Component {
  render() {
    const {rowIndex, field, data, ...props} = this.props;
    return (
      <Cell {...props}>
        {data[rowIndex][field]}
      </Cell>
    );
  }
}

class MyLinkCell extends React.Component {
  render() {
    const {rowIndex, field, data, ...props} = this.props;
    const link = data[rowIndex][field];
    return (
      <Cell {...props}>
        <a href={link}>{link}</a>
      </Cell>
    );
  }
}

class MyTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    	myTableHeader: this.props.data.header,
    	myTableData: this.props.data.data.slice(0, this.props.maxElement)
    };
  }


  render() {
  	let columns = [];
  	for(var i = 0; i < this.state.myTableHeader.length; i++) {
  		let wrd = this.state.myTableHeader[i];
  		columns.push(<Column header={<Cell>{wrd}</Cell>}
  		 	cell={props => (
  		 		<Cell {...props}>
  		 			{this.state.myTableData[props.rowIndex][wrd]}
  		 		</Cell>
  		 	)}
  		 	width={200}
  		 	key={i}
  		 	/>
  		);
  	}

    return (
    <div>
      <Table
        rowsCount={this.state.myTableData.length}
        rowHeight={50}
        headerHeight={50}
        width={this.state.myTableHeader.length * 201}
        height={this.state.myTableData.length * 51}>
	        {columns}
      </Table>
    </div>
    );
  }
}

export default MyTable;
