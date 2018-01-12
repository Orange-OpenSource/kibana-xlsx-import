import React from 'react';
import Collapsible from 'react-collapsible';

class MyTabs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabNames: this.props.names 
    };
  }

  render() {
    return (
    	<div>
			 <Collapsible trigger={this.state.tabNames[1]} open={true}>
	       <div id="view_tab"></div>
	     </Collapsible>

	     <Collapsible trigger={this.state.tabNames[2]}>
          <form className="form-inline">
	      		<input className="form-control" id="checkMapping" type="checkbox"/> <label>{this.state.tabNames[0]}</label>
          </form>
	        <div id="mapping_tab"></div>
	     </Collapsible>
      </div>
    );
  }
}

export default MyTabs;