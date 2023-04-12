import React, { Component,useEffect, useState, useContext } from "react";
import {Link, useParams} from 'react-router-dom'
import Nav from "./nav";



function FriendsPage() {

    const [friends, setFriends] = useState([])

    useEffect(()=> {
        fetch(`/backend/friends`)
        .then((res)=> res.json())
        .then(data=> {
            setFriends(data['friends'])
        })
    }, [])


   

    return(
        <div className="friends-page">
            <Nav/>
            <div className="friend-requests">
                {/* loop for each request (use map) */}
                {/* give for each request: the name of requester and two btns (refuse, accept) */}
            </div>
            <h2 style={{
            color: 'white', 
            fontWeight: '500',
            textAlign: 'center'
            }}>Friends 
                <div className="underline" style={{
                    width: '200px',
                    height: '15px',
                    background: 'white',
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)'

                }}>

                </div>
                </h2>
            <ul className="friends-list">

                {friends.map((friend)=> {
                    return(
                        <li>
                            <div>
                            <img src={friend['pic']}></img>
                            <Link to={`/profile/${friend['name']}`}><li>{friend['name']}</li></Link>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}


export default FriendsPage;