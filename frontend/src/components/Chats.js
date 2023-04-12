import React, {useEffect, useState, useContext, useMemo,} from "react";
import Chat from "./Chat";
import Nav from "./nav";
import { ChatContext, UserContext } from "./app";
import {BrowserRouter as Router, Switch, Route, Link, Redirect, useHistory} from "react-router-dom"
import CSRFToken from "./csrftoken";

function Chats(){
    const chats = useContext(ChatContext)
    const user = useContext(UserContext)
    const history = useHistory()
    // const [chats, setChats] = useState([])
    // make requests to chats view to get all the chats and display them
    // each chat div contains: the url to the chat, the url of the chat and the person
    // you're chatting to

  

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

     // start chat
     const startChat = (username) => {
        fetch(`/backend/${username}/create_chat`, {
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
                responder: username
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
        
        
        setTimeout(function(){
            setError()
        },5000)
    }

    return(
        <div className="chats">
            <Nav/>
            <div style={{marginTop: '50px'}} className="chats chats-open">
                     {
                      chats.map((chat)=> {
                          if(chat.last_message.length > 1){
                          return(
                              // <Link to={`/chat/${chat['title']}/${chat['id']}`}>
                              
                          <div className="chat-tab" style={{
                          display: 'flex',
                          flexDirection: 'row',
                          marginLeft: '5px'
                          
                      }}>
                          
                          <div className="image"></div>
                          
                          <div style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              color: 'white'
                          }}>
                              <div>
                                  <h3>{
                                      // go through each user in users
                                      chat['users'].map((chatUser)=> {
                                          // if the user is the same as logged in user
                                          // return null
                                          if(chatUser['username'] == user.username){
                                              return null
                                          }
                                          // display user which current user has got a chat with
                                          else {
                                              return (
                                                  <form  onSubmit={(e)=> {
                                                      e.preventDefault()
                                                      startChat(chatUser['username']) 
                                                      }
                                                  }
                                                      >
                                                  <CSRFToken />
                                                  <button type="submit" style={{
                                                      background: 'none',
                                                      border: 'none',
                                                      color: 'white'
                                                  }}>
                                                      {chatUser['username']}
                                                  </button>
                                                  </form>
                                              )
                                          }
                                      })
                                  
                                  }</h3>
                              <p>{chat['last_message']}</p>
                              </div>
                              <p>{chat['created_at']}</p>
                          </div>
                      </div>
                             
                              
                          )
                      }
                  })
                     }
                        
                    </div>
        </div>
    )
}



export default Chats