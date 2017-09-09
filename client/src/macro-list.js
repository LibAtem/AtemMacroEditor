import React from 'react';
import ReactDOM from 'react-dom';

import XMLParser from 'xml2js';

import {
  Link
} from 'react-router-dom'

// var XMLParser = require('react-xml-parser');
// var xml = new XMLParser().parseFromString(xmlText);    // Assume xmlText contains the example XML
// console.log(xml);
// console.log(xml.getElementsByTagName('Name'));


export class MacroListPage extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: true,
      macros: null,
    };
  }

  componentDidMount(){
    console.log("Loading macros");

    fetch('/assets/sample.xml').then(function(response) {
      if(response.ok) {
        return response.text();
      }
      throw new Error('Network response was not ok.');
    }).then(xmlText => {
      // console.log(res)
      XMLParser.parseString(xmlText, (err, res) => {
        console.log(res)
        this.setState({
          macros: res,
          loading: false,
        })
      });
    });
  }

  render(){
    if (this.state.loading)
      return <div>Loading...</div>;

    const rows = this.state.macros.MacroPool.Macro.map(m => <li key={m.$.index}><Link to={`/macro/${m.$.index}`}>{ m.$.name } ({ m.$.index })</Link></li>);

    return (
      <div>
        <h3>Macros:</h3>
        <ul>
        { rows }
        </ul>
      </div>
    );
  }
}