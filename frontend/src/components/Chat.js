import React, {useEffect, useState, useContext, useMemo, useCallback} from "react";
import {w3cwebsocket as W3CWebSocket} from "websocket"
import {Link, useParams, useHistory, useLocation} from "react-router-dom"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowLeft, faEllipsisVertical, faPaperPlane} from '@fortawesome/free-solid-svg-icons'
import {UserContext,ChatContext} from "./app"

// go here: https://blog.logrocket.com/build-chat-application-react-django-channels/
// https://channels.readthedocs.io/en/stable/topics/authentication.html#django-authentication
// https://channels.readthedocs.io/en/stable/
function Chat(){
    const [messages, setMessages] = useState([]);
    const [sendMessage, setSendMessage] = useState('');
    const {title, chat_id} = useParams();
    const user = useContext(UserContext);
    const [chatData, setChatData] = useState(localStorage.getItem('chatData'))
    const [responder, setResponder] = useState('')
    const [initiater, setInitiater] = useState('')
    const [prevMessages, setPrevMessages] = useState([])
    const [chatMenu, setChatMenu] = useState(false)
    const [userMenu, setUserMenu] = useState(false)

    useEffect(()=> {
        setChatData(JSON.parse(localStorage.getItem('chatData')))
        
    },[localStorage])

    useEffect(()=> {
        setResponder(chatData['users']?.['responder'])
        setInitiater(chatData['users']?.['initiater'])
        
    }, [chatData])


    const chatSocket = useMemo(() => {
        // create new websocket
        const socket = new WebSocket(`wss://${window.location.host}/wss/${title}/${chat_id}/`);
        // what should happen when the socket closes
        socket.onclose = function(e) {
           console.log('disconnected!')
        };
        // what should happen when the socket opens
        socket.onopen = function (e) {
            const data = JSON.parse(e.data)
            console.log('connected!')            
        }

        socket.onmessage = function (e) {
            // we parse the incoming chat data
            const data = JSON.parse(e.data);
            
            // omit the previousmessages and only get the recent chat messages
            const newdata = Object.fromEntries(
                Object.entries(data).filter(([key,value]) => key !== 'prevMessages')
                )
           
            setMessages(messages => [...messages, newdata]);
            setPrevMessages(prevMessages => [...prevMessages, data['prevMessages']])
            
            
        };
        
        return socket;
    }, [title]);

    const handleSubmit = useCallback((e) => {
        if(sendMessage.replace(/\s/g,'').length >= 1){
           
        chatSocket.send(JSON.stringify({
            'message': sendMessage,
            'sender': initiater,
            'receiver': responder
        }));
        e.preventDefault();
        setSendMessage('');
        }
        else {
            alert('Input is empty')
        }
    },[sendMessage, initiater, responder]);

    useEffect(() => {
        return () => {
            chatSocket.close();
        };
    }, [chatSocket]);



   
    
    


    return (
    <div className="chat-page">
        <nav style={{
            color: 'white',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: '5px',
            marginBottom: '25px',
            background: '#1F2A47'
        }}>
            {/* back btn here */}
            <Link to={'/'}><FontAwesomeIcon  style={{marginLeft: '5px'}} icon={faArrowLeft} size="2x"/> </Link>
            {
                initiater == user.username ?  
                <a style={{color: 'white'}} href={`/profile/${responder}`}> <h3 style={{
                    fontWeight: '500',
                    fontSize: '24px'
                }}>{responder}</h3></a>
                :
                <a style={{color: 'white'}} href={`/profile/${initiater}`}> <h3 style={{
                    fontWeight: '500',
                    fontSize: '24px'
                }}>{initiater}</h3></a>
            }
            <FontAwesomeIcon onClick={()=> chatMenu ? setChatMenu(false) : setChatMenu(true)} style={{marginRight: '5px' }} icon={faEllipsisVertical} size="2x"/>
        </nav>
        {
                chatMenu ? <div className="chat-menu" style={{
                    position: 'absolute',
                    background: 'rgb(31, 42, 71)',
                    height: '25%',
                    width: '50%',
                    top: '10%',
                    right: '0%',
                    zIndex: '2',
                    transform: 'translate(0%,-10%)'

                }}>
                    <ul className="chat-menu-items" style={{color: 'white'}}>
                        <li>Add user</li>
                        <li>Delete chat</li>
                        {
                        initiater == user.username 
                        ? 
                        <a style={{color: 'white'}} href={`/profile/${responder}`}><li>View profile</li></a>
                        :
                        <a style={{color:'white'}} href={`/profile/${initiater}`}><li>View profile</li></a>
                    }
                    </ul>
                </div> : null
            }
        <div className="chat-messages">     
                {
                    // loop through previosuly sent messages
                    prevMessages.map((message) => {
                        if(message != undefined){
                         return message.map((msg)=> {
                            if(msg['sender_username'] == user.username ){
                                return(
                                    <div className="chat-message send">
                                        {`${msg['content']}\n`}
                                    </div>
                                )
                            }
                            else {
                                return(
                                    <div className="chat-message received">
                                        {`${msg['content']}\n`}
                                    </div>
                                )
                            }
                        })
                    }
                   })
                     
                }

                {/* The newly send message */}
                {
                   messages.map((message) => {
                        
                        if(message['sender'] == user.username ){
                            return(
                                <div className="chat-message send">
                                    {`${message['message']}\n`}
                                </div>
                            )
                        }
                        else {
                            if(message['message'] == undefined){
                                return(null)
                            }
                            return(
                                <div className="chat-message received">
                                    {`${message['message']}\n`}
                                </div>
                            )
                        }
                   })
                }
            
        </div>
        <form  className="chat-footer">
            <input type="text" onChange={(e)=> {
                setSendMessage(e.target.value)
            }} placeholder="Type message..." value={sendMessage}></input>
            <button onClick={handleSubmit} type="submit"><FontAwesomeIcon icon={faPaperPlane} size="2x"/></button>
        </form>
    </div>
    )
}


export default Chat;