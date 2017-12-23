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
import { MacroPage } from './macro-page';
import { MacroCreate } from './macro-create';

// gonna be removed in production
if (__DEV__) {
  console.log('log log log log');
}


class Layout extends React.Component {
  render(){
    return (
      <div>
        <Navbar collapseOnSelect fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <LinkContainer to="/">
                <a>Atem Macro Editor</a>
              </LinkContainer>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
            <Nav>
              <LinkContainer exact eventKey={1} to="/">
                <NavItem>Home</NavItem>
              </LinkContainer>
              <LinkContainer eventKey={1} to="/create">
                <NavItem>New Macro</NavItem>
              </LinkContainer>
            </Nav>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Route exact path="/" component={MacroListPage}/>
        <Route path="/create" component={MacroCreate}/>
        <Route path="/macro/:id" component={MacroPage}/>
        
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