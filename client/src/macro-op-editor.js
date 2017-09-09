import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import update from 'react/lib/update';
import {
  Modal,
  Col, 
  Form, FormGroup, ControlLabel, FormControl,
  Button,
} from 'react-bootstrap'
import Slider from 'react-rangeslider';
import Switch from 'react-bootstrap-switch';

import Lang from './lang';
import { FindFieldSpec } from './spec';

export class MacroOpEditor extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      showModal: false,
      data: {},
    };
  }

  close(commit) {
    const { data } = this.state;

    this.setState({ 
      showModal: false,
      data: {},
    });

    if (commit === true)
      this.PromiseResolve(data);
    else
      this.PromiseReject();
  }

  open(data) {
    return new Promise((resolve, reject) => {
      this.PromiseResolve = resolve;
      this.PromiseReject = reject;

      this.setState({
        showModal: true,
        data: Object.assign({}, data),
      });
    });
  }

  renderControl(key) {
    const spec = FindFieldSpec(this.state.data.id, key)
    if (spec === null)
      return <FormControl.Static>Failed to find spec!</FormControl.Static>

    switch (spec.$.type){
      case "Enum":
        return this.renderEnumControl(key, spec);
      case "Bool":
        return this.renderBoolControl(key, spec);
      case "Int":
      case "Double":
        return this.renderSliderControl(key, spec);

      default:
        return <FormControl.Static>Unknown field type: {spec.$.type}</FormControl.Static>;
    }
  }

  renderEnumControl(key, spec){
    const change = e => {
      const updDat = { data: {} };
      updDat.data[key] = { $set: e.target.value };
      this.setState(update(this.state, updDat));
    };

    return (
      <FormControl componentClass="select" placeholder={spec.$.name} value={this.state.data[key]} onChange={change}>
        {
          spec.Value.map((v, i) => <option key={i} value={v.$.id}>{ v.$.name }</option>)
        }
      </FormControl>
    );
  }

  renderBoolControl(key, spec){
    const change = (e, v) => {
      const updDat = { data: {} };
      updDat.data[key] = { $set: v ? "true" : "false" };
      this.setState(update(this.state, updDat));
    };

    return <Switch value={this.state.data[key]=="true"} onChange={change} />
  }

  renderSliderControl(key, spec){
    let min = parseInt(spec.$.min);
    let max = parseInt(spec.$.max);
    let value = parseInt(this.state.data[key]);
    const scale = parseInt(spec.$.scale);
    let step = 1;

    if (!isNaN(scale)){
      min /= scale;
      max /= scale;
      value /= scale;
      step /= scale;
    }

    const horizontalLabels = {};
    horizontalLabels[min] = min;
    horizontalLabels[0] = 0;
    horizontalLabels[max] = max;

    const change = val => {
      if (val < min)
        val = min;
      if (val > max)
        val = max;

      if (!isNaN(scale))
        val *= scale;

      const updDat = { data: {} };
      updDat.data[key] = { $set: val };
      this.setState(update(this.state, updDat));
    };

    return [
      <Slider
        key={0}

        min={min}
        max={max}
        step={step}
        
        labels={horizontalLabels}

        onChange={change}
        value={value}
      />,
      <br key={1} />,
      <FormControl key={2} type="number" placeholder={spec.$.name} min={min} max={max} value={value} onChange={e => change(e.target.value)} />
    ];
  }

  render() {
    const { data, showModal } = this.state;

    const ids = Object.keys(data).filter(i => i != "id");

    return (
      <Modal show={showModal} onHide={() => this.close()}>
        <Modal.Header closeButton>
          <Modal.Title>{ data.id }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal>
            { 
              ids.map(k => {
                return (
                  <FormGroup key={k} controlId="formHorizontalEmail">
                    <Col componentClass={ControlLabel} sm={4}>
                      { k }
                    </Col>
                    <Col sm={8}>
                      { this.renderControl(k) }
                    </Col>
                  </FormGroup>
                );
              })
            }
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