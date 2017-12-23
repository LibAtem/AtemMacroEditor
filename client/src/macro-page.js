import React from 'react';
import update from 'react/lib/update';
import XMLParser from 'xml2js';

import {
  Row, Col, Alert,
  Button, ButtonToolbar
} from 'react-bootstrap';

import { MacroEditor } from './macro-editor';
import { MacroProps } from './macro-props';

export class MacroPage extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: true,
      macro: null,
      hasChanged: false,
      error: null,
    };
  }

  componentDidMount(){
    this.reloadData();
  }

  reloadData(){
    const id = this.props.match.params.id;
    console.log("Loading macro " + id);

    fetch('/api/macros/' + id).then(function(response) {
      if(response.ok) {
        return response.text();
      }
      throw new Error('Network response was not ok.');
    }).then(xmlText => {
      // console.log(res)
      XMLParser.parseString(xmlText, (err, res) => {
        if (err != null){
          this.setState({
            macro: null,
            loading: false,
            hasChanged: false,
            error: ["Failed to load macro", err],
          });
          return;
        }

        if (!res.Macro.Op)
          res.Macro.Op = [];

        this.setState({
          macro: res,
          loading: false,
          hasChanged: false,
          error: null,
        });

      });
    }).catch(err => {
      this.setState({
        macro: null,
        loading: false,
        hasChanged: false,
        error: ["Failed to load macro", err],
      })
    });
  }

  doDelete(){
    if (!window.confirm("Are you sure you want to delete this macro?"))
      return;

    const id = this.props.match.params.id;
    console.log("Deleting macro " + id);

    fetch('/api/macros/' + id, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/xml'
      },
    }).then(function(response) {
      if(response.ok) {
        return response.text();
      }
      throw new Error('Network response was not ok.');
    }).then(() => {      
      this.props.history.push("/");
    });
  }

  saveMacro(){
    const id = this.props.match.params.id;
    console.log("Saving macro " + id);

    let builder = new XMLParser.Builder();
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
    }).then(xmlText => {
      console.log(xmlText);
      
    });
  }

  updateMacroState(up){
    this.setState(update(this.state, {
      hasChanged: {
        $set: true
      },
      macro: up
    }));
  }

  renderInner(){
    const { macro, loading, hasChanged, error } = this.state;

    if (error) {
      return (
        <Col xs={12}>
          <Alert bsStyle="danger">
            <h4>An error occured</h4>
            { error.map((v,i) => <p key={i}>{v+""}</p>) }
            {
              macro == null
              ? <p><Button bsStyle="primary" onClick={() => this.reloadData()}>Reload</Button></p>
              : <p><Button bsStyle="primary" onClick={() => this.setState({ error: null})}>Ignore</Button></p>
            }
          </Alert>
        </Col>
      );
    }
    
    if (loading)
      return <div>Loading...</div>;

    return (
      <div>
        <h3>
          Edit Macro: 
        </h3>

        <MacroProps macro={macro} updateState={up => this.updateMacroState(up)} ref={e => this.Props = e} />
        <MacroEditor macro={macro} updateState={up => this.updateMacroState(up)} ref={e => this.Editor = e} />

        <ButtonToolbar>
          <Button bsStyle="primary" onClick={() => this.saveMacro()}>Save</Button>
          <Button bsStyle="danger" onClick={() => this.doDelete()}>Delete Macro</Button>        
        </ButtonToolbar>
      </div>
    );
  }

  render(){
    return (
      <div className="container mainElm">
        <Row>
          <Col xs={12}>
            { this.renderInner() }
          </Col>
        </Row>
      </div>
    );
  }
}
