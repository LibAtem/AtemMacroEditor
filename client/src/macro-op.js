import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';

import {
  Link
} from 'react-router-dom'

import Lang from './lang';

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

const validIdFields = [
  "mixEffectBlockIndex",
  "keyIndex",
  "mediaPlayer",
  "index",
  "boxIndex",
];

export function MacroOpNames(data, targetLength){
  const parts = [ data.id ];
  for (let f of validIdFields){
    const val = data[f];
    if (val !== undefined && val !== null)
      parts.push(Lang.formatString(Lang.ids[f], parseInt(val)+1));
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

    return this.props.showEdit()
  }

  render(){
    const { isDragging, connectDragSource, connectDropTarget } = this.props;
    const opacity = isDragging ? 0 : 1;

    const nameParts = MacroOpNames(this.props.data, this.props.cols);

    return connectDragSource(connectDropTarget(
      <tr>
        {nameParts.map((n, i) => {
          if (i == 0)
            return <td key={0}><a href="#" onClick={e => this.showEdit(e)}>{ n }</a></td>;

          return <td key={i}>{ n }</td>;
        })}
      </tr>
    ));
  }
}