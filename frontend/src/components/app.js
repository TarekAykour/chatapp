import React, { Component,useEffect, useState } from "react";
import {BrowserRouter as Router, Switch, Route, Link, Redirect} from "react-router-dom"
import { render } from "react-dom";
import Home from "./home"
import Login from "./login"
import Register from "./Register"
import UserPage from "./UserPage";
import FriendsPage from "./Friends";
import Chat from "./Chat";
import Chats from "./Chats";
import About from "./About";


export const UserContext = React.createContext('user');
export const ChatContext = React.createContext([]);
export const ArchivedChats = React.createContext([])
function App() {
  const [user, setUser] = useState({})
  const [chat, setChat] = useState({})
  const [data, setData] = useState({})
  const [chats,setChats] = useState([])

  useEffect(()=> {
    fetch('/backend/user')
    .then((response)=> response.json())
    .then((data)=> {
        setUser(data)
    })
    }, {})

    useEffect(()=> {
      fetch('/backend/allchats')
      .then((res)=> res.json())
      .then((data) => {
          setChats(data)
      })
  },[])

  
  

  
    return (
      <Router>
      <UserContext.Provider value={user}>
        <ChatContext.Provider value={chats}>
        <Switch>
          <Route path='/' exact component={user.logged ? Home : Login}/>
          <Route path='/login' component={user.logged ? Home : Login}/>
          <Route path='/register' component={user.logged ? Home : Register}/>
          <Route path='/profile/:username' component={UserPage} />
          <Route path='/friends' component={FriendsPage} />
          <Route path='/chat/:title/:chat_id' component={Chat}/>
          <Route path='/chats' component={user.logged ? Chats : Login} />
          <Route path='/about' component={About} />
        </Switch>
        </ChatContext.Provider>
      </UserContext.Provider>
      </Router>
    );
  }
  
  
  const appDiv = document.getElementById('app');
  
  render(< App/>, appDiv)


  export default App;