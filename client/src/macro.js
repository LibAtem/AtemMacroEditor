import React from 'react';
import ReactDOM from 'react-dom';

import XMLParser from 'xml2js';

import {
  Link
} from 'react-router-dom'

import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { MacroOp, MacroOpNames } from './macro-op';
import { MacroOpEditor } from './macro-op-editor';

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

    fetch('/assets/sample.xml').then(function(response) {
      if(response.ok) {
        return response.text();
      }
      throw new Error('Network response was not ok.');
    }).then(xmlText => {
      // console.log(res)
      XMLParser.parseString(xmlText, (err, res) => {
        // console.log(res)

        for(let mac of res.MacroPool.Macro){
          // console.log(mac)
          if (mac.$.index == id){
            console.log(mac);

            this.setState({
              macro: mac,
              loading: false,
              hasChanged: false,
            })
            return;
          }
        }
      });
    });
  }

  moveCard(dragIndex, hoverIndex) {
    const { Op } = this.state.macro;
    const dragCard = Op[dragIndex];

    this.setState(update(this.state, {
      hasChanged: {
        $set: true
      },
      macro: {
        Op: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        },
      },
    }));
  }

  editOperation(i, op){
    console.log("Edit Op #" + i + " (" + op.id + ")");

    this.Editor.open(op).then(res => {
      console.log(res, this.state.macro.Op[i]);

      this.setState(update(this.state, {
        hasChanged: {
          $set: true
        },
        macro: {
          Op: {
            $splice: [
              [i, 1, { "$": res }]
            ]
          }
        }
      }));

    }).catch(() => {});
  }

  render(){
    if (this.state.loading)
      return <div>Loading...</div>;

    const maxCols = Math.max(...this.state.macro.Op.map(m => MacroOpNames(m.$).length));
    const rows = this.state.macro.Op.map((m, i) => <MacroOp key={i} index={i} moveCard={this.moveCard} data={m.$} cols={maxCols} showEdit={() => this.editOperation(i, m.$)} />);

    return (
      <div>
        <h3>Edit Macro:</h3>
        { this.state.hasChanged ? <p>Save</p> : "" }
        <MacroOpEditor ref={e => this.Editor = e} />
        <table className="macro-op-table">
          <tbody>
            { rows }
          </tbody>
        </table>
      </div>
    );
  }
}
