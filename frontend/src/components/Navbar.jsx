import React from "react";
import {
    Bars,
    Nav,
    NavLink,
    NavMenu
} from "./navbarelements";

const Navbar = () => {
    return (
        <>
            <Nav>
                <Bars />
                <NavMenu>
                    <NavLink to="/" >
                        Home
                    </NavLink>
                    <NavLink to="/map" >
                        Map
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};

export default Navbar;