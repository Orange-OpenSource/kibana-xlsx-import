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
	        	<div id="tabs1"></div>
	      	</Collapsible>

	      	<Collapsible trigger="Define Mapping">
	        	<div id="tabs2"></div>
	      	</Collapsible>
      	</div>
    );
  }
}

export default MyTabs;