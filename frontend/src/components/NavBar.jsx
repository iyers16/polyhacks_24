import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import { FaBars } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import logo from './logo.png'; // Make sure to put the logo in the src folder and update the path here

export const NavBar = () => {
    const [Mobile,setMobile]=useState(false);

    return (
        <section className="navbar">
            <div className="logo-container">
                <img src={logo} alt="Radius15 Logo" className="navbar-logo" />
                <h3 className="logo">RADIUS15</h3>
            </div>
            <ul className={Mobile ? "nav-links-mobile" : "nav-links"} onClick={()=> setMobile(false)}>
               
                <Link to='/HeatMap'><li>Let me Lead You</li></Link>
            </ul>
            <button className="mobile-menu-icon" onClick={() => setMobile(!Mobile)}>
                {Mobile ? <ImCross/> : <FaBars/>}
            </button>
        </section>
    )
}

export default NavBar;
