import React from 'react';
import ReactDOM from 'react-dom';

import XMLParser from 'xml2js';

import {
  Link
} from 'react-router-dom'

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

    fetch('/api/macros').then(function(response) {
      if(response.ok) {
        return response.text();
      }
      throw new Error('Network response was not ok.');
    }).then(xmlText => {
      XMLParser.parseString(xmlText, (err, res) => {
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

    // TODO this.state.macros.Macros.Macros can be undefined
    const rows = this.state.macros.Macros.Macros[0].MacroProperties.filter(m => m.$.used == "true").map(m => <li key={m.$.id}><Link to={`/macro/${m.$.id}`}>{ m.$.name } ({ m.$.id })</Link></li>);

    return (
      <div className="container mainElm">
        <div className="row">
          <div className="col-xs-12">
            <h3>Macros:</h3>
            <ul>
            { 
              rows.length == 0
              ? "No macros exist!"
              : rows 
            }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}