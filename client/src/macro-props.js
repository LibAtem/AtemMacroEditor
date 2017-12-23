import React from 'react';

import {
  FormGroup, ControlLabel, FormControl,
} from 'react-bootstrap';

export class MacroProps extends React.Component {

  onName(e){
    this.props.updateState({
      Macro: {
        $: {
          name: {
            $set: e.target.value
          }
        }
      }
    });
  }

  
  onDescription(e){
    this.props.updateState({
      Macro: {
        $: {
          description: {
            $set: e.target.value
          }
        }
      }
    });
  }

  render(){
    const { macro } = this.props;

    return (
      <form>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl type="text" value={macro.Macro.$.name} onChange={(e) => this.onName(e)}  />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Notes</ControlLabel>
          <FormControl componentClass="textarea" value={macro.Macro.$.description} onChange={(e) => this.onDescription(e)} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Operations</ControlLabel>
        </FormGroup>
      </form>
    );
  }
}