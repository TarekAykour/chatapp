import React, { Component,useEffect, useState } from "react";
import {BrowserRouter as Router ,Link ,useHistory} from "react-router-dom"
import { render } from "react-dom";
import CSRFToken from "./csrftoken"
import Logo from "./logo";



function Register(){
    const [username, setUsername] = useState()
    const [email, setEmail] = useState()
    const [phone, setPhone] = useState()
    const [password, setPassword] = useState()
    const [confirmation, setConfirmation] = useState()
    const [countries, setCountries] = useState([])
    const [visible, setVisible] = useState(false)
    const [error,setError] = useState()
    let history = useHistory()

    // countries api
    useEffect(()=> {
        fetch('https://restcountries.com/v3.1/all')
        .then(response => (response.json()))
        .then(data => {
            setCountries(data)
        })
    }, {})

    

    // sets the states to the corresponding values that later will be send to the server
    const handleChange = (event) => {
        if(event.target.name === "username"){
            setUsername(event.target.value)
        }
        else if(event.target.name === "email"){
            setEmail(event.target.value)
        }
        else if (event.target.name === "phone"){
            setPhone(event.target.value)
        }
        else if(event.target.name === "password"){
            setPassword(event.target.value)
        }
        else if(event.target.name === "confirmpassword"){
            setConfirmation(event.target.value)
        }
    }


    // csrf token
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
        fetch('/backend/register', {
            credentials:'include', 
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
                
                
            },
            body: JSON.stringify({
                username: username,
                email: email,
                phone: phone,
                password: password,
                confirmation: confirmation,
                
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


    // show passwords
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
    <div>
        <div className="register-page form-page">
            <Logo/>
            <h2> Register </h2>
            <form onSubmit={handleSubmit}>
                <div className="inputs">
                    <CSRFToken/>
                    <input type="text" name="username" placeholder="username" onChange={handleChange}></input>
                    <input type="email" name="email" placeholder="email" onChange={handleChange}></input>
                    <input type="tel" name="phone" placeholder="phonenumber" onChange={handleChange}></input>
                    <input type="password" name="password" placeholder="password" onChange={handleChange}></input>
                    <input type="password" name="confirmpassword" placeholder="confirm password" onChange={handleChange}></input>
                </div>
                <input type="submit" name="Login" value="Register" className="sign-btn"></input>
            </form>
            {error ? <p className="alert alert-danger" role="alert">{error}</p> : ''}
            <div>
                <button type="button" className="google-btn">Sign up with Google</button>
            </div>
            <p>Already have an account? <Link to="/login">Sign in</Link></p>

        </div>
    </div>
    )
}


export default Register