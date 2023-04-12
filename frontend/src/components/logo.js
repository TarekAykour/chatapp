import React from "react";



function Logo(){
    return(
        <div className="logo" style={{
            marginBottom: '5%'
        }}>
            <h2 style={{
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold'
            }}>sockY</h2>
            <div className="underline" style={{
                padding: '5px',
                maxWidth: '50%',
                background: 'white',
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)'
                }}></div>
        </div>
    )
}


export default Logo
