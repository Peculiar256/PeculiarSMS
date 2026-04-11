import React from "react";
import './Banner.css'

function Banner(){
    return(
        <div className="Bannerview">
            <div style={{width: "100%", height:"250px", padding:"60px", borderRadius:"10px", marginTop:"20px", marginRight: "20px", boxShadow:"0 0 5px gray"}}>
            <h1>Hello jovia. Welcome back?</h1>
            <h2>Your Future is Loading......</h2>
            <button
                style={{width:"auto", padding:"10px", marginTop: "10px", fontSize:"1em", color:"white", borderRadius:"10px", border:"none", backgroundColor:"#2c4ebb"}}
            >Here is your overview!</button>
        </div>
        </div>
    )
}

export default Banner;