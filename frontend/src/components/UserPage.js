import React, { Component,useEffect, useState, useContext } from "react";
import {useParams, useLocation, useHistory, Link} from 'react-router-dom'
import Nav from "./nav";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faMessage, faUserPlus, faUserMinus, faEdit, faTimes, faCheck} from '@fortawesome/free-solid-svg-icons'
import CSRFToken from "./csrftoken"
import { UserContext,ChatContext } from "./app";




function UserPage(){
    
    const {username} = useParams()
    const location = useLocation()
    const user = useContext(UserContext)
    const history = useHistory()
    // const [chat, setChat] = useContext(ChatContext)
    
    

    // get name, bio, if they're friend, chat
    const [profile, setProfile] = useState({})
    const [error, setError] = useState()
    const [openEdit, setOpenEdit] = useState(false)
    const [bio, setBio] = useState('')
    
    
   
    // get user info
    useEffect(()=>{
        fetch(`/backend/user/${username}`, {
            method: 'GET'
        })
        .then(res => res.json())
        .then((data)=> {
            setProfile(data)
            setBio(data['bio'])
           
        })
    },[location.pathname])

    

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




    
    // add user 
    const addUser = (e) => {
        fetch(`/backend/add_friend/${profile['user']}`, {
            credentials: 'include',
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                action: 'addUsr'
            })
        })
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }
            else {
            window.location.reload();
             return res.json();
           }    
          })
          .catch(err => {
             setError(JSON.parse(err.message)["error"]);
          });
        
        e.preventDefault()
        setTimeout(function(){
            setError()
        },5000)
        
        
    }
    

    
    // remove user
    const removeUser = (e) => {
        fetch(`/backend/remove_friend/${profile['user']}`, {
            credentials: 'include',
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                action: 'removeUser'
            })
        })
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }
            else {
            window.location.reload();
             return res.json();
           }    
          })
          .catch(err => {
             setError(JSON.parse(err.message)["error"]);
          });
        
        e.preventDefault()
        setTimeout(function(){
            setError()
        },5000)
    }


    // start chat
    const startChat = (e) => {
        fetch(`/backend/${profile['user']}/create_chat`, {
            credentials: 'include',
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                initiater: user.username,
                responder: profile['user']
            })
        })
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }
            else {
            return res.json()
           }    
          }).then(data => {
            localStorage.setItem('chatData', JSON.stringify(data))
            history.push(`/chat/${data['title']}/${data['chat_id']}`)
            // setChat(data)
            
          })
          .catch(err => {
             setError(JSON.parse(err.message)["error"]);
          });
        
        e.preventDefault()
        setTimeout(function(){
            setError()
        },5000)
    }

    // handle biochange
   
    const submitBio = (e) => {
        fetch(`/backend/user/bio/${profile['user']}`, {
            credentials: 'include',
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                bio: bio
            })
        })
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }
            else {
                window.location.reload()
                return res.json()
           }    
          }).then(data => {
            
          })
          .catch(err => {
             setError(JSON.parse(err.message)["error"]);
          });
        
        e.preventDefault()
        setOpenEdit(false)
        setTimeout(function(){
            setError()
        },5000)
        
    }
    

    // handle profilepic change

    return(
        <div>
            <Nav/>
            <div className="profile-page">
                <header>
                    <div style={{
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                        }}>
                        <div>
                            <img src=""></img>
                            <h2 style={{color: 'white'}}>{profile['user']}</h2>
                        </div>
                        <div>
                        <p style={{color: 'white'}}>{profile['friends']} friends</p>
                        </div>
                    </div>


                     {
                     user.username != profile['user'] ?        
                    <div className="icons" 
                    style={{
                    color: 'white', 
                    display: 'flex',
                    flexDirection: 'row'
                    
                    }}>
                        <div className="icon-background">
                        <form onSubmit={startChat}>
                        {/* to={`/chat/${profile['user']}/33`} */}
                            
                            <button style={{
                                background: 'none',
                                border: 'none',
                                color: 'white'
                            }} type="submit">
                                <CSRFToken />
                                <FontAwesomeIcon 
                                icon={faMessage} 
                                size="2x"
                                
                                // go to chat link
                                />
                            </button>
                            
                        </form>
                        </div>
                            {
                            
                            profile['isFriend'] ?
                            <form onSubmit={removeUser}>
                                <CSRFToken/>
                                <button 
                                className="icon-background" 
                                name="removeUser" 
                                type="submit"
                                value="removeUser"
                                
                                style={{color:'white', border: 'none', textAlign: 'center'}}
                                ><FontAwesomeIcon icon={faUserMinus}  size="2x"/>
                                </button>
                            </form>
                            :
                            <form onSubmit={addUser}>
                                <CSRFToken/>
                                <button 
                                className="icon-background" 
                                name="addUser" 
                                type="submit"
                                value="addUser"
                                
                                style={{color:'white', border: 'none', textAlign: 'center'}}
                                ><FontAwesomeIcon icon={faUserPlus}  size="2x"/>
                                </button>
                            </form>
                            }
                        
                    </div>
                    :
                    <div></div>
                    }
                    
                </header>
                <div className="profile-info">
                    <h2>Info</h2>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: '25px'
                    }}>
                        <div style={{marginBottom: '50px'}}>
                            <p>Username</p>
                            <h3>@{profile['user']}</h3>
                        </div>
                        <div>
                            <p>Bio</p>
                           {
                             profile['user'] == user.username 
                             ? 
                             <div style={{
                                color:'white',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                                
                                }}>
                                <h3 style={{fontSize: '20px', fontWeight: '300'}}>{profile['bio']}</h3>
                                {openEdit 
                                ? 
                                <form style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly'
                                }} onSubmit={submitBio}>
                                    <CSRFToken />
                                    <input style={{
                                        border: 'none',
                                        background: '#1F2A47',
                                        color: '#7A7B7B'
                                    }} placeholder="change bio" value={bio} onChange={(e)=> setBio(e.target.value)} type="text" />
                                    <div>
                                    <button style={{
                                        width: '50px',
                                        height: '50px',
                                        textAlign: 'center'
                                    }} type="button" onClick={()=> setOpenEdit(false)} className="btn btn-danger">
                                        <FontAwesomeIcon icon={faTimes} size="2x" style={{color:'white'}} />
                                    </button>
                                    <button style={{
                                        width: '50px',
                                        height: '50px',
                                        textAlign: 'center'
                                    }} type="submit" className="btn btn-success">
                                        <FontAwesomeIcon icon={faCheck} size="2x" style={{color:'white'}} />
                                    </button>
                                    </div>
                                </form>
                                 : 
                                <FontAwesomeIcon style={{color:'white'}} icon={faEdit} size="2x"
                                    onClick={()=> setOpenEdit(true)}
                                />}
                             </div>
                              : 
                             <h3 style={{fontSize: '20px', fontWeight: '300'}}>{profile['bio']}</h3>
                           }
                           
                        </div>
                    </div>
                </div>
                <div className="report-div">
                    <a href="#" style={{color: '#fc493d'}}><p>Report</p></a>
                </div>
            </div>
            {error ? <p className="alert alert-danger" role="alert">{error}</p> : ''}
        </div>
    )
}


export default UserPage;