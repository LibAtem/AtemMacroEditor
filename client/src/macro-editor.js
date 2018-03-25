import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { MacroOp, MacroOpNames, MacroOpFooter } from './macro-op';
import { MacroOpEditor } from './macro-op-editor';
import { SelectMacroType } from './select-type';
import { FindOpSpec } from './spec';

@DragDropContext(HTML5Backend)
export class MacroEditor extends React.Component {
  constructor(props){
    super(props);
    this.moveCard = this.moveCard.bind(this);

    this.state = {
      macro: null,
      hasChanged: false,
    };
  }

  moveCard(dragIndex, hoverIndex) {
    const { Op } = this.props.macro.Macro;
    const dragCard = Op[dragIndex];

    this.props.updateState({
      Macro: {
        Op: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        },
      },
    });
  }

  editOperation(i, op){
    console.log("Edit Op #" + i + " (" + op.id + ")");

    this.Editor.open(op).then(res => {

      this.props.updateState({
        Macro: {
          Op: {
            $splice: [
              [i, 1, { "$": res }]
            ]
          }
        }
      });

    }).catch(() => {});
  }

  deleteOperation(i){
    console.log("Delete Op #" + i);

    this.props.updateState({
      Macro: {
        Op: {
          $splice: [
            [i, 1]
          ]
        }
      }
    });
  }

  addOperation(i){
    if (i === undefined || i === null)
      i = this.props.macro.Macro.Op.length;

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
        this.props.updateState({
          Macro: {
            Op: {
              $splice: [
                [i, 0, { "$": res2 }]
              ]
            }
          }
        });

      });
    }).catch(() => {});
  }

  render(){
    const ops = (this.props.macro.Macro.Op || []);
    const maxCols = Math.max(...ops.map(m => MacroOpNames(m.$).length));
    const rows = ops.map((m, i) => <MacroOp key={i} index={i} moveCard={this.moveCard} data={m.$} cols={maxCols} 
      showEdit={() => this.editOperation(i, m.$)} doDel={() => this.deleteOperation(i)} showInsert={() => this.addOperation(i)} />);

    const count = ops.length;
    if (count == 0)
      rows.push(<tr key="none"><td colSpan={4}>This macro does not yet do anything</td></tr>);

    return (
      <div>
        <MacroOpEditor ref={e => this.Editor = e} />
        <SelectMacroType ref={e => this.Selector = e} />

        <table className="macro-op-table">
          <tbody>
            { rows }
            <MacroOpFooter count={count} cols={maxCols} showInsert={() => this.addOperation(ops.length)} />
          </tbody>
        </table>
      </div>
    );
  }
}
