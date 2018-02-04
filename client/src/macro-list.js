import React from 'react';
import XMLParser from 'xml2js';

import { LinkContainer } from 'react-router-bootstrap';
import {
  Col, Row, 
  Button, ButtonGroup, Alert,
} from 'react-bootstrap';

export class MacroListPage extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: true,
      macros: null,
      error: null,
    };
  }

  componentDidMount(){
    this.reloadData();
  }

  reloadData(){
    console.log("Loading macros");
    this.setState({
      loading: true,
      error: null,
    });

    fetch('/api/macros').then(function(response) {
      if(response.ok) {
        return response.text();
      }
      throw new Error('Network response was not ok.');
    }).then(xmlText => {
      XMLParser.parseString(xmlText, (err, res) => {
        if (err != null){
          this.setState({
            macros: null,
            loading: false,
            error: ["Failed to parse macro list", err],
          });
          return;
        }

        this.setState({
          macros: res,
          loading: false,
          error: null,
        });
      });
    }).catch(err => {
      this.setState({
        macros: null,
        loading: false,
        error: ["Failed to load macros", err],
      })
    });
  }

  renderInner(){
    if (this.state.error) {
      return (
        <Col xs={12}>
          <Alert bsStyle="danger">
            <h4>An error occured</h4>
            { this.state.error.map((v,i) => <p key={i}>{v+""}</p>) }
            <p><Button bsStyle="primary" onClick={() => this.reloadData()}>Retry</Button></p>
          </Alert>
        </Col>
      );
    }
    
    if (this.state.loading)
      return <Col xs={12}>Loading...</Col>;

    if (!this.state.macros.Macros || !this.state.macros.Macros.Macros)
      return <Col xs={12}>Loading...</Col>;
    
    return this.state.macros.Macros.Macros[0].MacroProperties.map(m => {
      if (!m.$.used || m.$.used == "false"){
        return (
          <Col xs={3} key={m.$.id} className="macroListEntry">
            <div className="inner">
              <p>&nbsp;</p>
              <p className="idNumber">#{ parseInt(m.$.id)+1 }</p>
            </div>
          </Col>
        );
      }

      return (
        <Col xs={3} key={m.$.id} className="macroListEntry">
          <div className="inner">
            <p>{ m.$.name }</p>
            <p className="idNumber">#{ parseInt(m.$.id)+1 }</p>
            <p>
              <ButtonGroup>
                <LinkContainer to={`/macro/${m.$.id}`}>
                  <Button bsStyle="info">Edit</Button>
                </LinkContainer>
                <Button bsStyle="success">Run</Button>
              </ButtonGroup>
            </p>
          </div>
        </Col>
      );
    });
  }

  render(){
    return (
      <div className="container mainElm">
        <Row>
          <Col xs={12}>
            <h3>Macros:</h3>
          </Col>
          <Col xs={12} className="macroListWrapper">
            { this.renderInner() }
          </Col>
        </Row>
      </div>
    );
  }
}