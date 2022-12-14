import React from 'react';
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from "shards-react";

class MenuBar extends React.Component {
  render() {
    return (
      <Navbar type="dark" theme="primary" expand="md">
        <NavbarBrand href="/">NGA exhibitions</NavbarBrand>
        <Nav navbar>
          <NavItem>
            <NavLink active href="/">
              Home
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active href="/artists">
              Artists
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active href="/artworks" >
              Artworks
            </NavLink>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }
}

export default MenuBar
