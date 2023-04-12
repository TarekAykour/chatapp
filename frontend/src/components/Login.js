import React, { Component,useEffect, useState } from "react";
import {BrowserRouter as Router, Switch, Route, Link, useHistory} from "react-router-dom"
import { render } from "react-dom";
import CSRFToken from "./csrftoken"
import Logo from "./logo";

function Login(){
    const [username, setUsername] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [error,setError] = useState()
    const history = useHistory()
    const [visible, setVisible] = useState(false)

    const handleChange = (event) => {
        if(event.target.name == "email"){
            setEmail(event.target.value)
        }
        else if(event.target.name == "username"){
            setUsername(event.target.value)
        }
        else if(event.target.name == "password"){
            setPassword(event.target.value)
        }

    }


    
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
    

    const handleSubmit = (event) => {
      
        fetch('/backend/login', {
            credentials:'include', 
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
                
            },
            body: JSON.stringify({
                username: username,
                password: password
               
            })
        })
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }
            else {
             history.push("/")
             location.reload()
             return res.json();
           }    
          })
          .catch(err => {
             setError(JSON.parse(err.message)["error"]);
          });
        event.preventDefault()
        setTimeout(function(){
            setError()
        },5000)
    }



    function showPassword() {
        const passwords = document.getElementsByName('password')
        passwords.forEach(pp => {
            if(pp.getAttribute('type') === 'password'){
                pp.type = 'text'
                setVisible(true)
                
            }
             else {
                pp.type = 'password'
                setVisible(false)
            }
        })
        } 

    return(
        <div className="login-page form-page">
            <Logo/>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
            <CSRFToken/>
                <div>
                <div className="inputs">
                    <input type="text" name="username" placeholder="email or username" onChange={handleChange}></input> <br></br>
                    <input type="password" name="password" placeholder="password" onChange={handleChange}></input>
                </div>
                {/* <a href="#" style={{
                    float: 'right'
                }}>Forgot password?</a> */}
                </div>
                <input style={{
                    background: '#0046FF',
                    color: 'white',
                    
                    
                
                }} type="submit" name="Login" value="Login" className="sign-btn"></input>
            </form>
            {error ? <p className="alert alert-danger" role="alert">{error}</p> : ''}
            <div>
                <button  type="button" className="google-btn">Google Login</button>
            </div>
            <p>Don't have an account? <Link to="/register">Sign Up</Link></p>

        </div>
    )
}


export default Login