import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';

import { IdFields } from './lang';

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const cardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveCard(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

export function MacroOpNames(data, targetLength){
  const parts = [ data.id ];
  for (let f of Object.keys(IdFields)){
    const val = data[f];
    if (val !== undefined && val !== null)
      parts.push(IdFields[f](data.id, val));
  }

  if (targetLength === undefined)
    return parts;

  while (parts.length < targetLength)
    parts.push("");

  return parts;
}

@DropTarget("MacroOp", cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource("MacroOp", cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
export class MacroOp extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
    moveCard: PropTypes.func.isRequired,
  };

  showEdit(e){
    e.preventDefault();

    return this.props.showEdit();
  }

  showInsert(e){
    e.preventDefault();

    this.props.showInsert();
  }

  doDel(e){
    e.preventDefault();

    this.props.doDel();
  }

  render(){
    const { connectDragSource, connectDropTarget } = this.props;

    const nameParts = MacroOpNames(this.props.data, this.props.cols);

    return connectDragSource(connectDropTarget(
      <tr>
        { nameParts.map((n, i) => <td key={i}>{ n }</td>) }
        <td className="borderLeft"><a href="#" onClick={e => this.showEdit(e)}>Edit</a></td>
        <td><a href="#" onClick={e => this.showInsert(e)}>Insert</a></td>
        <td><a href="#" onClick={e => this.doDel(e)}>Del</a></td>
      </tr>
    ));
  }
}


export class MacroOpFooter extends React.Component {
  showInsert(e){
    e.preventDefault();

    this.props.showInsert();
  }

  render(){
    const nameParts = [];
    for (let i = 1; i < this.props.cols; i++)
      nameParts.push(<td key={i}>&nbsp;</td>);

    return (
      <tr>
        <td>Total { this.props.count } Operations</td>
        { nameParts }
        <td className="borderLeft invisible-text compact">Edit</td>
        <td className="compact"><a href="#" onClick={e => this.showInsert(e)}>Insert</a></td>
        <td className="invisible-text compact">Del</td>
      </tr>
    );
  }
}