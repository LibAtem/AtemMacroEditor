import React from 'react';
import ReactDOM from 'react-dom';

import XMLParser from 'xml2js';
import keydown from 'react-keydown';
import Websocket from 'react-websocket';

import {
  Button,
} from 'react-bootstrap';

const perPage = 9;

export class PiPlayerPage extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      page: 1,
      loading: true,
      macros: null,
      atem: {},
      auto: false,
      selected: -1,
    };
  }

  componentDidMount(){
    this.reloadList();
  }

  @keydown( 111 ) // numpad/
  reloadList(){
    console.log("Loading macros");

    fetch('/api/macros').then(function(response) {
      if(response.ok) {
        return response.text();
      }
      throw new Error('Network response was not ok.');
    }).then(xmlText => {
      // console.log(res)
      XMLParser.parseString(xmlText, (err, res) => {
        console.log(res)
        this.setState({
          macros: res,
          loading: false,
        })
      });
    });
  }

  socketData(d) {
    d = JSON.parse(d);
    console.log("Atem:", d)
    this.setState({ atem: d });
  }

  getCellIndex(i){
    const { page } = this.state;

    return (page - 1) * perPage + i;
  }

  maxPage(){
    return Math.ceil(this.getMacros().length / perPage)
  }

  cyclePage(delta){
    let newPage = this.state.page + delta;
    let maxPage = this.maxPage();

    if (newPage < 1)
      newPage = maxPage;
    if (newPage > maxPage)
      newPage = 1;

    console.log("Change page:", newPage);
    this.setState({ page: newPage });
  }

  getMacros(){
    return this.state.macros.Macros.Macros[0].MacroProperties;
  }

  runMacro(i) {
    const index = this.getCellIndex(i);
    const props = this.getMacroProps(index);
    if (!props || !props.used)
      return;

    if (this.state.auto){
      console.log("Sel macro:", index);
      const newInd = index == this.state.selected ? -1 : index;
      this.setState({ selected: newInd });
      return;
    }

    console.log("Run macro:", index);
    fetch('/api/player/run/'+index, {
      method: "POST",
      headers: {
        'Content-Type': 'application/xml'
      },
    });
  }

  @keydown( 96, 'enter' ) // numpad0 numpad-enter
  runAutoMacro(){
    const index = this.state.selected;
    if (index < 0)
      return;

    fetch('/api/player/run/'+index, {
      method: "POST",
      headers: {
        'Content-Type': 'application/xml'
      },
    });
  }

  @keydown( 103 ) // numpad7
  btnNum7(){
    this.runMacro(1)
  }
  @keydown( 104 ) // numpad8
  btnNum8(){
    this.runMacro(2)
  }
  @keydown( 105 ) // numpad9
  btnNum9(){
    this.runMacro(3)
  }
  @keydown( 100 ) // numpad4
  btnNum4(){
    this.runMacro(4)
  }
  @keydown( 101 ) // numpad5
  btnNum5(){
    this.runMacro(5)
  }
  @keydown( 102 ) // numpad6
  btnNum6(){
    this.runMacro(6)
  }
  @keydown( 97 ) // numpad1
  btnNum1(){
    this.runMacro(7)
  }
  @keydown( 98 ) // numpad2
  btnNum2(){
    this.runMacro(8)
  }
  @keydown( 99 ) // numpad3
  btnNum3(){
    this.runMacro(9)
  }

  @keydown( 109 ) // numpad-
  btnPrevPage(){
    this.cyclePage(-1)
  }
  @keydown( 107 ) // numpad+
  btnNextPage(){
    this.cyclePage(1)
  }
  @keydown( 110 ) // numpad.
  btnAuto(){
    this.setState({ auto: !this.state.auto });
  }

  getMacroProps(index){
    //const { index, macros } = this.props;
    const macros = this.getMacros();
    if (macros == null || macros == undefined)
      return "";

    if (!macros[index] || macros[index].$ === undefined)
      return "-";

    const props = macros[index].$;
    if (props.used == "false")
      props.used = false;
    if (props.used == "true")
      props.used = true;

    return props;
  }
  renderMacroButton(i, char){
    const index = this.getCellIndex(i);789
    const props = this.getMacroProps(index);

    let style = "default";
    if (this.state.selected == index && this.state.auto)
      style = "warning";
    else if (props.used)
      style = "info";

    return (
      <Button bsSize="large" className="larger macro btn-block" onClick={() => this.runMacro(i)} 
        disabled={!props.used} bsStyle={style}>
        <span className="char">({ char })</span>
        <span className="name">{ props.name }</span>
      </Button>
    );
  }

  renderLoopBtn(){
    let bsStyle = "default";
    if (this.state.atem.Loop)
      bsStyle = "danger";

    const click = () => {
      fetch('/api/player/loop/' + (this.state.atem.Loop ? 0 : 1), {
        method: "POST",
        headers: {
          'Content-Type': 'application/xml'
        },
      });
    }

    return <Button bsSize="large" bsStyle={bsStyle} className="larger btn-block" onClick={click}>
        <span className="char">(*)</span>
        <span className="name">Loop</span>
      </Button>;
  }

  clickStop(){
    fetch('/api/player/stop', {
      method: "POST",
      headers: {
        'Content-Type': 'application/xml'
      },
    });
  }

  renderStatusText(){
    const { atem, selected, auto } = this.state;
    if (atem.IsRunning)
      return "Running - " + this.getMacroProps(atem.Index).name + "(#" + atem.Index + ")";

    if (selected >= 0 && auto)
      return "Queued - " + this.getMacroProps(selected).name + "(#" + selected + ")";

    return "Waiting";
  }

  renderPad(){
    const macros = this.getMacros();

    return (
      <table id="numpad">
        <tbody>
          <tr>
            <td colSpan={3} className="status"><span>{ this.renderStatusText() }</span></td>
          </tr>
          <tr>
            <td>Page { this.state.page } / { this.maxPage() }</td>
            <td className="key">{ this.renderLoopBtn() }</td>
            <td className="key">
              <Button bsSize="large" className="larger btn-block" bsStyle={this.state.auto?"default":"danger"} onClick={() => this.btnAuto()}>
                <span className="char">(.)</span>
                <span className="name">Auto</span>
              </Button>
            </td>
          </tr>
          <tr>
            <td className="key">{ this.renderMacroButton(1, "7") }</td>
            <td className="key">{ this.renderMacroButton(2, "8") }</td>
            <td className="key">{ this.renderMacroButton(3, "9") }</td>
          </tr>
          <tr>
            <td className="key">{ this.renderMacroButton(4, "4") }</td>
            <td className="key">{ this.renderMacroButton(5, "5") }</td>
            <td className="key">{ this.renderMacroButton(6, "6") }</td>
          </tr>
          <tr>
            <td className="key">{ this.renderMacroButton(7, "1") }</td>
            <td className="key">{ this.renderMacroButton(8, "2") }</td>
            <td className="key">{ this.renderMacroButton(9, "3") }</td>
          </tr>
        </tbody>
      </table>
    );
  }

  // <td className="key"><Button bsSize="large" className="larger btn-block" onClick={() => this.cyclePage(-1)}>Page -</Button></td>
  // <td className="key"><Button bsSize="large" className="larger btn-block" onClick={() => this.cyclePage(1)}>Page +</Button></td>
  
  // <td className="key" rowSpan={2}>
  //   <Button bsSize="large" className="larger btn-block height-double" bsStyle="default" onClick={() => this.clickStop()}>
  //     <span className="char">(Enter)</span>
  //     <span className="name">Stop</span>
  //   </Button>
  // </td>
  // <td className="key">
  //   <Button bsSize="large" className="larger btn-block" onClick={() => this.reloadList()}>
  //     <span className="char">(/)</span>
  //     <span className="name">Reload</span>
  //   </Button>
  // </td>
  // <td className="key" colSpan={2}>
  //   <Button bsSize="large" className="larger btn-block" bsStyle="default" disabled={!this.state.auto || this.state.selected < 0} onClick={() => this.runAutoMacro()}>
  //     <span className="char">(0)</span>
  //     <span className="name">Run</span>
  //   </Button>
  // </td>

  render(){
    const inner = this.state.loading ? <p>Loading</p> : this.renderPad();

    const socketUrl = window.location.origin.replace("http", "ws") + "/ws";

    return (
      <div className="container-fluid mainElm">
        <div className="row">
          <div className="col-xs-12">
            
            <Websocket url={socketUrl} onMessage={this.socketData.bind(this)}/>
          
            { inner }
          </div>
        </div>
      </div>
    );
  }
}
