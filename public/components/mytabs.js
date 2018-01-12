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
	      		<label>Use a personnal mapping <input id="checkMapping" type="checkbox"/></label>
	        	<div id="mapping_tab"></div>
	      	</Collapsible>
      	</div>
    );
  }
}

export default MyTabs;