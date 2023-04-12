import React, { Component,useEffect, useState, useContext } from "react";
import {BrowserRouter as Router, Switch, Route, Link, Redirect, useHistory} from "react-router-dom"
import { render } from "react-dom";
import CSRFToken from "./csrftoken";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowLeft, faBars, faMagnifyingGlass, faTimes, faUserGroup} from '@fortawesome/free-solid-svg-icons'
import {UserContext} from "./app"




function Nav(){
    const user = useContext(UserContext)
    const [open, setOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [results, setResults] = useState([])
    const [listResults, setListResults] = useState([])
    const [profile, setProfile] = useState()

    let history = useHistory()

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');




    // search trough messages, users, etc
    const handleSearch = (e) => {
        fetch('/backend/search', {
            credentials:'include', 
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
                
            },
            body: JSON.stringify({
                search: search
            })   
        })
        .then(res => res.json())
        .then(data => {
            setResults(data)
        })

    }
    

    useEffect(()=> {
        for(let key in results){
            for(let i = 0; i < results[key].length; i ++){
                setListResults(results[key])
            }
        }
    })
    

    // results[key][i]

    


    // loop through keys
    // check if the key is messengers, people, etc
    // loop through each key array 
    // print out the chat of the message or person, etc


    // loop through keys
    // append the keys in a new state array
    // loop through that array
    // PROBLEM WE DO NOT KNOW WHETHER THEY ARE MESSAGES, PEOPLE, ETC
    // SOLUTION: TAKE THE FIRST ARRAY AS MSG, SECOND AS PEOPLE, ETC
    // BUT THIS WONT BE DYNAMIC
    


   
    
    // closing the nav


    function logout(e){
        fetch('/backend/logout', {
            credentials:'include', 
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            }
        })
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }
            else {
             location.reload()
             return res.json();

           }    
          })
          .catch(err => {
            setError(JSON.parse(err.message)["error"]);
          });
          sessionStorage.removeItem('csrftoken');
          sessionStorage.removeItem('user');
          e.preventDefault()
          history.push('/')
    }

    
    
    return(
        <nav>
            {
                searchOpen ? 

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    margin: '5px',
                    position: 'relative'
                    
                }}>
                    <FontAwesomeIcon style={{color:'#354777'}} icon={faArrowLeft} size="3x"
                        onClick={()=> setSearchOpen(false)}
                    />
                    <input style={{
                            border: 'none',
                            background: '#1F2A47',
                            color: '#7A7B7B',
                            width: '75%'
                        }}
                        type="search"
                        name="search" 
                        placeholder="search messages"
                        onChange={(e)=> {
                            setSearch(e.target.value.toLocaleLowerCase()) 
                            handleSearch(e) 
                        }}
                        ></input>
                        <div className={ listResults.length >= 1 && search !== "" ? "dropdown dropdown-displayed" : "dropdown dropdown-hidden"}>
                            {
                                
                                listResults.map((result)=> {
                                    if(result['content']){
                                      
                                        return (
                                            <div className="dropdown-item">
                                                <Link style={{color:'white'}} to={`/chat/${result['group_name']}/${result['group_id']}`}><h3 style={{
                                                    fontSize: '18px',
                                                    fontWeight: '500'
                                                    }}>{result['group_name']}</h3>
                                                </Link>
                                                <p>{result['content']}</p>
                                            </div>
                                        )
                                    }
                                    else if(result['name']){
                                        
                                        return (
                                            <div className="dropdown-item">
                                                <div className="profile-pic">
                                                    <img src={result['profilepic']}></img>
                                                </div>
                                                <Link onClick={()=> {
                                                    document.querySelector('.dropdown').classList.remove('dropdown-displayed')
                                                    document.querySelector('.dropdown').classList.add('dropdown-hidden')
                                                    
                                                    
                                                    }} to={`/profile/${result['name']}`} style={{color: 'white'}}><p>{result['name']}</p></Link>
                                            </div>
                                        )
                                    }
                                    
                                })
                                
                            }
                        </div>
                    
                </div>

                :

                <ul className="desktop-nav">
                <li><FontAwesomeIcon icon={faBars} size="3x" onClick={()=> setOpen(true)}/></li>
                <li>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-evenly'
                    }}>
                        <li style={{marginRight: '15px'}}><FontAwesomeIcon icon={faMagnifyingGlass} size="3x"
                            onClick={()=> {
                                searchOpen ? setSearchOpen(false) : setSearchOpen(true)
                            }}
                        /></li>
                        <li><a style={{color: '#354777'}} href="/friends"><FontAwesomeIcon icon={faUserGroup} size="3x"/></a><span className="round"></span></li>
                    </div>
                </li>
            </ul>
            }

            {
            open ? 

            <div className="mobile-nav mobile-open">
                <header>

                    <div style={{ 
                        display: 'flex',
                         flexDirection: 'row', 
                         justifyContent: 'space-between'
                         }}>
                        <div className="profile-image"></div>
                        <FontAwesomeIcon icon={faTimes} size="3x" 
                        style={{color: 'white', margin: '5px'}} 
                        onClick={()=> setOpen(false)}
                        />
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        margin: '5px',
                        
                    }}>
                        <Link to={`/profile/${user.username}`}><h2>{user.username}</h2></Link>
                        <p>{user.phone}</p>
                    </div>
                    
                </header>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="">New group</a></li>
                    <li><a href="/friends">Friends</a></li>
                    <li><a href="#">Keys</a></li>
                    <li><a href="#">Chat settings</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="#">Theme settings</a></li>
                    <li><a href="/chats">Chats</a></li>
                    <li><form onSubmit={logout}>
                        <CSRFToken/>
                        <button className="btn btn-danger" type="submit">Logout</button>
                        </form></li>
                </ul>

                
            </div>
            
            : <div className="mobile-nav mobile-closed">
                <header>
                        <div style={{ 
                            display: 'flex',
                             flexDirection: 'row', 
                             justifyContent: 'space-between'
                             }}>
                            <div className="profile-image"></div>
                            <FontAwesomeIcon icon={faTimes} size="3x" 
                            style={{color: 'white', margin: '5px'}} 
                            onClick={()=> setOpen(false)}
                            />
                        </div>
                         
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            margin: '5px',

                        }}>
                            <Link to={`/profile/${user.username}`}><h2>{user.username}</h2></Link>
                            <p>{user.phone}</p>
                        </div>

                        </header>
                        <ul>
                        <li><a href="">New group</a></li>
                        <li><a href="/friends">Friends</a></li>
                        <li><a href="#">Keys</a></li>
                        <li><a href="#">Chat settings</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="#">Theme settings</a></li>
                        <li><a href="/chat">Chat</a></li>
                        <li><form onSubmit={logout}>
                        <CSRFToken/>
                        <button className="btn btn-danger" type="submit">Logout</button>
                        </form></li>
                        </ul>

                        
                </div>
                }
        </nav>
    )
}


export default Nav