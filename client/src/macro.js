import React from 'react';
import ReactDOM from 'react-dom';

import XMLParser from 'xml2js';

import { Link } from 'react-router-dom';
import {
  Button
} from 'react-bootstrap';

import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { MacroOp, MacroOpNames } from './macro-op';
import { MacroOpEditor } from './macro-op-editor';
import { SelectMacroType } from './select-type';
import { FindOpSpec } from './spec';

@DragDropContext(HTML5Backend)
export class MacroPage extends React.Component {
  constructor(props){
    super(props);
    this.moveCard = this.moveCard.bind(this);

    this.state = {
      loading: true,
      macro: null,
      hasChanged: false,
    };
  }

  componentDidMount(){
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
        console.log(res)

        this.setState({
          macro: res,
          loading: false,
          hasChanged: false,
        })

      });
    });
  }

  moveCard(dragIndex, hoverIndex) {
    const { Op } = this.state.macro.Macro;
    const dragCard = Op[dragIndex];

    this.setState(update(this.state, {
      hasChanged: {
        $set: true
      },
      macro: {
        Macro: {
          Op: {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragCard],
            ],
          },
        },
      },
    }));
  }

  editOperation(i, op){
    console.log("Edit Op #" + i + " (" + op.id + ")");

    this.Editor.open(op).then(res => {
      console.log(res, this.state.macro.Macro.Op[i]);

      this.setState(update(this.state, {
        hasChanged: {
          $set: true
        },
        macro: {
          Macro: {
            Op: {
              $splice: [
                [i, 1, { "$": res }]
              ]
            }
          }
        }
      }));

    }).catch(() => {});
  }

  deleteOperation(i){
    console.log("Delete Op #" + i);

    this.setState(update(this.state, {
        hasChanged: {
          $set: true
        },
        macro: {
          Macro: {
            Op: {
              $splice: [
                [i, 1]
              ]
            }
          }
        }
      }));
  }

  addOperation(i){
    if (i === undefined || i === null)
      i = this.state.macro.Macro.Op.length;

    // TODO show dialog and stuff.
    this.Selector.open().then(res => {
      console.log(res);
      if (res == "")
        return;

      const spec = FindOpSpec(res);
      if (spec === null)
        return alert("Invalid Operation type");

      const op = { id: res };

      for (let field of spec.Field){
        if (field.$.default !== undefined){
          op[field.$.id] = field.$.default;
          continue;
        }

        switch (field.$.type){
          case "Bool":
            op[field.$.id] = "false";
            break;
          case "Enum":
            op[field.$.id] = field.Value[0].$.id;
            break;
          case "Int":
          case "Double":
            if (parseInt(field.$.min) <= 0)
              op[field.$.id] = "0";
            else
              op[field.$.id] = field.$.min;

            break;
        }
      }

      return this.Editor.open(op).then(res2 => {
        this.setState(update(this.state, {
          hasChanged: {
            $set: true
          },
          macro: {
            Macro: {
              Op: {
                $splice: [
                  [i, 0, { "$": res2 }]
                ]
              }
            }
          }
        }));

      });
    }).catch(() => {});
  }

  saveMacro(){
    // TODO
  }

  render(){
    if (this.state.loading)
      return <div>Loading...</div>;

    const maxCols = Math.max(...this.state.macro.Macro.Op.map(m => MacroOpNames(m.$).length));
    const rows = this.state.macro.Macro.Op.map((m, i) => <MacroOp key={i} index={i} moveCard={this.moveCard} data={m.$} cols={maxCols} 
      showEdit={() => this.editOperation(i, m.$)} doDel={() => this.deleteOperation(i)} showInsert={() => this.addOperation(i)} />);

    return (
      <div>
        <MacroOpEditor ref={e => this.Editor = e} />
        <SelectMacroType ref={e => this.Selector = e} />

        <h3>
          Edit Macro: 
          { this.state.hasChanged ? <Button bsStyle="primary" onClick={() => this.saveMacro()}>Save</Button> : "" }          
        </h3>
        <table className="macro-op-table">
          <tbody>
            { rows }
          </tbody>
        </table>
        <p>
          <Button bsStyle="success" onClick={() => this.addOperation()}>Add</Button>
          { this.state.hasChanged ? <Button bsStyle="primary" onClick={() => this.saveMacro()}>Save</Button> : "" }          
        </p>
      </div>
    );
  }
}
