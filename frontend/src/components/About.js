import React, { Component,useEffect, useState, useContext } from "react";
import Nav from "./nav";



function About() {
    return(
        <div>
            <Nav />
            <div style={{
                color:'white',
                width: '50%',
                margin: 'auto'
                }}>
                <h3>About SockY</h3>
                <p>Socky is an online chatapp, where users can chat with one another without their
                    data getting leaked. Add friends, costumize your profile, Make groups with SockY!
                </p>
            </div>
        </div>
    )
}


export default About;