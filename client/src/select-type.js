import React from 'react';
import {
  Modal,
  Col, 
  Form, FormGroup, ControlLabel, FormControl,
  Button,
} from 'react-bootstrap';

import { GetAllTypes } from './spec';

export class SelectMacroType extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      showModal: false,
      selected: "",
    };
  }

  close(commit) {
    const { selected } = this.state;

    this.setState({ 
      showModal: false,
      selected: "",
    });

    if (commit === true)
      this.PromiseResolve(selected);
    else
      this.PromiseReject();
  }

  open() {
    return new Promise((resolve, reject) => {
      this.PromiseResolve = resolve;
      this.PromiseReject = reject;

      this.setState({
        showModal: true,
        selected: "",
      });
    });
  }

  renderControl(selected){
    const types = GetAllTypes();

    const change = e => {
      this.setState({
        selected: e.target.value
      });
    };

    return (
      <FormControl componentClass="select" placeholder="MacroOperation" value={selected} onChange={change}>
        {
          types.map((v, i) => <option key={i} value={v}>{ v }</option>)
        }
      </FormControl>
    );
  }

  render() {
    const { selected, showModal } = this.state;

    return (
      <Modal show={showModal} onHide={() => this.close()}>
        <Modal.Header closeButton>
          <Modal.Title>Select Operation Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal>
            <FormGroup controlId="formHorizontalEmail">
              <Col componentClass={ControlLabel} sm={4}>
                Type
              </Col>
              <Col sm={8}>
                { this.renderControl(selected) }
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={() => this.close(true)}>OK</Button>
          <Button onClick={() => this.close()}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}