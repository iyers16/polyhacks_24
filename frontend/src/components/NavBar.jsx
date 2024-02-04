import React, { useState } from "react";
import {
    Link
} from "react-router-dom";
import "./NavBar.css";
import { FaBars } from "react-icons/fa";
import { ImCross } from "react-icons/im";

export const NavBar = () => {
    const [Mobile,setMobile]=useState(false);
    return (
        <section className="navbar">
                <h3 className="logo"> RADIUS15</h3>
                <ul className={Mobile ? "nav-links-mobile" : "nav-links"} onClick={()=> setMobile(false)}>
                    <Link to='/Home'><li></li></Link>
                    <Link to='/HeatMap'><li>Let me Lead You</li></Link>
                </ul>
                <button className="mobile-menu-icon" onClick={() => setMobile(!Mobile)}>
                    <FaBars/>
                    {Mobile?<ImCross/> : <FaBars/>}
                </button>
        </section>
    )
}
export default NavBar