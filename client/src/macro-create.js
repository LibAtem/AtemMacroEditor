import React from 'react';
import update from 'react/lib/update';
import XMLParser from 'xml2js';

import {
  Button, ButtonToolbar
} from 'react-bootstrap';

import { MacroEditor } from './macro-editor';
import { MacroProps } from './macro-props';
import { SelectMacroId } from './select-id';

const BlankXmlText = "<Macro index=\"-1\" name=\"New Macro\" description=\"\"></Macro>";

export class MacroCreate extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      macro: null,
      hasChanged: false,
    };
  }

  componentDidMount(){
    XMLParser.parseString(BlankXmlText, (err, res) => {
      if (!res.Macro.Op)
        res.Macro.Op = [];

      this.setState({
        hasChanged: true,//false,
        macro: res
      });
    });
  }

  doCancel(){
    if (!window.confirm("Are you sure you want to discard this macro?"))
      return;

    console.log("Discard macro");
    this.props.history.push("/");
  }

  saveMacro(){
    console.log("Prompt for slot");

    this.Selector.open().then(id => {
      console.log("Saving to " + id);

      const builder = new XMLParser.Builder();
      const data = builder.buildObject(this.state.macro);

      fetch('/api/macros/' + id, {
        method: "POST",
        body: data,
        headers: {
          'Content-Type': 'application/xml'
        },
      }).then(function(response) {
        if(response.ok) {
          return response.text();
        }
        throw new Error('Network response was not ok.');
      }).then(() => {
        this.props.history.push("/macro/" + id);        
      }); // TODO - catch error

    }).catch(() => {});
  }

  updateMacroState(up){
    this.setState(update(this.state, {
      hasChanged: {
        $set: true
      },
      macro: up
    }));
  }

  updateMacroProps(up){
    this.setState(update(this.state, {
      macro: up
    }));
  }

  getStatusMessage(){
    if (this.state.saving)
      return "Saving...";

    if (this.state.hasChanged)
      return "Unsaved changes";

    return "Saved";
  }

  renderInner(){
    const { macro, hasChanged } = this.state;

    if (!macro)
      return <div>Loading...</div>;
    
    return (
      <div>
        <h3>
          Create Macro: 
        </h3>
        <p>
          { this.getStatusMessage() }
          <ButtonToolbar>
            <Button bsStyle="primary" disabled={!hasChanged} onClick={() => this.saveMacro()}>Save</Button>
            <Button bsStyle="danger" onClick={() => this.doCancel()}>Cancel</Button>        
          </ButtonToolbar>
        </p>

        <SelectMacroId ref={e => this.Selector = e} />

        <MacroProps macro={macro} updateState={up => this.updateMacroProps(up)} ref={e => this.Props = e} />
        <MacroEditor macro={macro} updateState={up => this.updateMacroState(up)} ref={e => this.Editor = e} />

        <ButtonToolbar>
          <Button bsStyle="primary" disabled={!hasChanged} onClick={() => this.saveMacro()}>Save</Button>
          <Button bsStyle="danger" onClick={() => this.doCancel()}>Cancel</Button>        
        </ButtonToolbar>
      </div>
    );
  }

  render(){
    return (
      <div className="container mainElm">
        <div className="row">
          <div className="col-xs-12">
            { this.renderInner() }
          </div>
        </div>
      </div>
    );
  }
}
