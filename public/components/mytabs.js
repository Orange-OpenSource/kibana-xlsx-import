import React from 'react';
import Collapsible from 'react-collapsible';
import { findDOMNode } from 'react-dom'

class MyTabs extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange(model, event) {
    var getFromBetween = {
      results:[],
      string:"",
      getFromBetween:function (sub1,sub2) {
          if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
          var SP = this.string.indexOf(sub1)+sub1.length;
          var string1 = this.string.substr(0,SP);
          var string2 = this.string.substr(SP);
          var TP = string1.length + string2.indexOf(sub2);
          return this.string.substring(SP,TP);
      },
      removeFromBetween:function (sub1,sub2) {
          if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
          var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
          this.string = this.string.replace(removal,"");
      },
      getAllResults:function (sub1,sub2) {
          // first check to see if we do have both substrings
          if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

          // find one result
          var result = this.getFromBetween(sub1,sub2);
          // push it to the results array
          this.results.push(result);
          // remove the most recently found one from the string
          this.removeFromBetween(sub1,sub2);

          // if there's more substrings
          if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
              this.getAllResults(sub1,sub2);
          }
          else return;
      },
      get:function (string,sub1,sub2) {
          this.results = [];
          this.string = string;
          this.getAllResults(sub1,sub2);
          return this.results;
      }
    };
    let keys = getFromBetween.get(event.target.value, "{", "}");
    let template = event.target.value;

    keys.forEach(function(key) {
      if(model[key] != undefined)
        template = template.replace('{'+key+'}', model[key]);
      else
        template = template.replace('{'+key+'}', key);
    })
    findDOMNode(this.refs.previewID).value = template;
  }


  render() {
    return (
    	<div>
			 <Collapsible trigger={this.props.names[1]} open={true}>
	       <div id="view_tab"></div>
	     </Collapsible>

	     <Collapsible trigger={this.props.names[2]}>
          <form className="form-inline">
	      		<input className="form-control" id="checkMapping" type="checkbox"/> <label>{this.props.names[0]}</label>
          </form>
	        <div id="mapping_tab"></div>
	     </Collapsible>

       <Collapsible trigger={this.props.names[3]}>
         <div ng-show="showUploadOptions">
           <div className="form-group row">
             <div className="form-group col-md-2 nopadding">
               <label>'INDEX_NAME_LABEL'</label>
               <input type="text" className="form-control" ng-model="indexName" id="indexName"/>
             </div>
           </div>
           <div className="form-group row">
             <div className="form-group col-md-4 nopadding">
               <label>'ES_ID_LABEL'</label>
               <input type="text" placeholder="Use placeholder {fieldname} to generate the ID" className="form-control" id="esID" onChange={(evt) => this.handleChange(this.props.model, evt)}/>
             </div>
             <div className="form-group col-md-4 nopadding">
               <label>'ES_PREVIEW_ID_LABEL'</label>
               <input type="text" className="form-control" readOnly id="previewID" ref="previewID"/>
             </div>
           </div>
         </div>
       </Collapsible>
      </div>
    );
  }
}

export default MyTabs;
