import './app.scss';

import React from 'react';
import ReactDOM from 'react-dom';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import {
  Nav, Navbar, NavItem, NavDropdown, 
  MenuItem, 
} from 'react-bootstrap';

import { MacroListPage } from './macro-list';
import { MacroPage } from './macro';

// gonna be removed in production
if (__DEV__) {
  console.log('log log log log');
}


const BasicExample = () => (
  <Router>
    <div>
      <ul>
        <li><Link to="/">Macro List</Link></li>
      </ul>

      <hr/>

      <Route exact path="/" component={MacroListPage}/>
      <Route path="/macro/:id" component={MacroPage}/>
    </div>
  </Router>
)

class BasePage extends React.Component {
  render(){
    return (
      <div>
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">Atem Macro Editor</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
          </Nav>
          <Nav pullRight>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="container">
        <div className="row">
          <div className="col-xs-12">
            <BasicExample />
          </div>
        </div>
      </div>
      </div>
    );
  }
}

ReactDOM.render(
  <BasePage />,
  document.getElementById('root')
);