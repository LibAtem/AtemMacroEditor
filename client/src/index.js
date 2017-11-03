import './app.scss';

import React from 'react';
import ReactDOM from 'react-dom';

import {
  BrowserRouter,
  Route, 
} from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import {
  Nav, Navbar, NavItem,  
} from 'react-bootstrap';

import { MacroListPage } from './macro-list';
import { MacroPage } from './macro';
import { PiPlayerPage } from './player/pi';

// gonna be removed in production
if (__DEV__) {
  console.log('log log log log');
}


class Layout extends React.Component {
  render(){
    return (
      <div>
        <Navbar inverse collapseOnSelect fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="#">Atem Macro Editor</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
            <Nav>
              <LinkContainer eventKey={1} to="/macros">
                <NavItem>Editor</NavItem>
              </LinkContainer>
              <LinkContainer eventKey={2} to="/player-pi">
                <NavItem>Pi Player</NavItem>
              </LinkContainer>
            </Nav>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Route exact path="/macros" component={MacroListPage}/>
        <Route path="/macro/:id" component={MacroPage}/>
        <Route path="/player-pi" component={PiPlayerPage}/>
        
      </div>
    );// <Redirect from='/' to='/macros' exact />
  }
}

class Router extends React.Component {
  render(){
    return (
      <BrowserRouter>
        <Route path='/' component={Layout} />
      </BrowserRouter>
    );
  }
}

ReactDOM.render(
  <Router />,
  document.getElementById('root')
);