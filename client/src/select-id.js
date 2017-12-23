import React from 'react';
import {
  Modal, Alert,
  Col, 
  Form, FormGroup, ControlLabel, FormControl,
  Button,
} from 'react-bootstrap';
import XMLParser from 'xml2js';

import { GetAllTypes } from './spec';
import { ParseMacroList } from './parser';

export class SelectMacroId extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      showModal: false,
      loading: true,
      macros: null,
      error: null,
      selected: 0,
    };
  }

  close(commit) {
    const { selected, macros } = this.state;

    const macro = macros ? macros[selected] : null;
    if (commit && macro && macro.used && !confirm("This will replace the existing macro. Are you sure?"))
      return;

    this.setState({
      showModal: false,
      macros: null,
      error: null,
      loading: true,
      selected: 0,
    });

    if (commit === true)
      this.PromiseResolve(macro.id);
    else
      this.PromiseReject();
  }

  open() {
    this.setState({
      showModal: true,
      macros: null,
      error: null,
      selected: 0,
    });

    return new Promise((resolve, reject) => {
      this.PromiseResolve = resolve;
      this.PromiseReject = reject;

      fetch('/api/macros').then(function(response) {
        if(response.ok) {
          return response.text();
        }
        throw new Error('Network response was not ok.');
      }).then(xmlText => {
        return ParseMacroList(xmlText).then(res => {
          this.setState({
            macros: res,
            loading: false,
            error: null,
          });
        })
      }).catch(err => {
        this.setState({
          macros: null,
          loading: false,
          error: ["Failed to load macros", err],
        })
      });
    });
  }

  renderControl(){
    const { macros, selected, loading, error } = this.state;

    if (error)
      return (
        <Alert bsStyle="danger">
          <h4>An error occured</h4>
          { error.map((v,i) => <p key={i}>{v+""}</p>) }
        </Alert>
      );

    if (loading)
      return <FormControl.Static>Loading...</FormControl.Static>;

    const change = e => {
      this.setState({
        selected: e.target.value
      });
    };

    console.log(macros)

    return (
      <FormControl componentClass="select" value={selected} onChange={change}>
        {
          macros.map((v, i) => {
            const name = "#" + (v.id+1) + (v.name ? " - ("+v.name+")" : "");
            return <option key={i} value={i} data-used={v.used}>{ name }</option>
          })
        }
      </FormControl>
    );
  }

  render() {
    const { showModal } = this.state;

    return (
      <Modal show={showModal} onHide={() => this.close()}>
        <Modal.Header closeButton>
          <Modal.Title>Select Macro Slot</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal>
            <FormGroup controlId="formHorizontalEmail">
              <Col componentClass={ControlLabel} sm={4}>
                Slot
              </Col>
              <Col sm={8}>
                { this.renderControl() }
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={() => this.close(true)}>Create</Button>
          <Button onClick={() => this.close()}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}