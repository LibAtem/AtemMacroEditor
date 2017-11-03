import React from 'react';
import update from 'react/lib/update';
import {
  Modal,
  Col, 
  Form, FormGroup, ControlLabel, FormControl,
  Button,
} from 'react-bootstrap';
import Slider from 'react-rangeslider';
import Switch from 'react-bootstrap-switch';

import { FindOpSpec } from './spec';

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

  renderControl(spec) {
    if (spec === null)
      return <FormControl.Static>Failed to find spec!</FormControl.Static>;

    switch (spec.$.type){
      case "Enum":
        return this.renderEnumControl(spec);
      case "Bool":
        return this.renderBoolControl(spec);
      case "Flags":
        return this.renderFlagsControl(spec);
      case "Int":
      case "Double":
        return this.renderSliderControl(spec);

      default:
        return <FormControl.Static>Unknown field type: {spec.$.type}</FormControl.Static>;
    }
  }

  renderEnumControl(spec){
    const change = e => {
      const updDat = { data: {} };
      updDat.data[spec.$.id] = { $set: e.target.value };
      this.setState(update(this.state, updDat));
    };

    return (
      <FormControl componentClass="select" placeholder={spec.$.name} value={this.state.data[spec.$.id]} onChange={change}>
        {
          spec.Value.map((v, i) => <option key={i} value={v.$.id}>{ v.$.name }</option>)
        }
      </FormControl>
    );
  }

  renderBoolControl(spec){
    const change = (e, v) => {
      const updDat = { data: {} };
      updDat.data[spec.$.id] = { $set: v ? "true" : "false" };
      this.setState(update(this.state, updDat));
    };

    return <Switch value={this.state.data[spec.$.id]=="true"} onChange={change} />;
  }

  renderFlagsControl(spec){
    const change = (e, v) => {
      let ids = this.state.data[spec.$.id].split(",").map(v => v.trim());
      const i = ids.indexOf(e.props.id);
      if (i >= 0)
        ids.splice(i, 1);

      if (v)
        ids.push(e.props.id);

      // Add / remove 'None' value
      if (ids.length == 0)
        ids.push("None");
      if (ids.length > 1){
        const nonInd = ids.indexOf("None");
        if (nonInd >= 0)
          ids.splice(nonInd, 1);
      }

      const updDat = { data: {} };
      updDat.data[spec.$.id] = { $set: ids.join(", ") };
      this.setState(update(this.state, updDat));
    };

    const ids = this.state.data[spec.$.id].split(",").map(v => v.trim());
    return spec.Value.filter(v => v.$.id != 0 && v.$.id != "None").map(v => {
      return (
        <p key={v.$.id}>
          <span>{ v.$.name }: </span>
          <Switch value={ids.indexOf(v.$.id) >= 0} onChange={change} id={v.$.id} />
        </p>
      );
    });
  }


  renderSliderControl(spec){
    let min = parseInt(spec.$.min);
    let max = parseInt(spec.$.max);
    let value = parseInt(this.state.data[spec.$.id]);
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
      updDat.data[spec.$.id] = { $set: val };
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

    const spec = FindOpSpec(this.state.data.id);
    if (spec == null)
      return <div></div>;

    return (
      <Modal show={showModal} onHide={() => this.close()}>
        <Modal.Header closeButton>
          <Modal.Title>{ data.id }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal>
            { 
              spec.Field.map(k => {
                return (
                  <FormGroup key={k.$.id} controlId="formHorizontalEmail">
                    <Col componentClass={ControlLabel} sm={4}>
                      { k.$.id }
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