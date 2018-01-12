import React from 'react';
import Collapsible from 'react-collapsible';

class MyTabs extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
    	<div>
			 <Collapsible trigger="View Data" open={true}>
	       <div id="view_tab"></div>
	     </Collapsible>

	     <Collapsible trigger="Define Mapping">
          <form className="form-inline">
	      		<input className="form-control" id="checkMapping" type="checkbox"/> <label>Use a personnal mapping</label>
          </form>
	        <div id="mapping_tab"></div>
	     </Collapsible>
      </div>
    );
  }
}

export default MyTabs;