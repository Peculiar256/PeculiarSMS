import React from "react";
import './FrontBanner.css'

function FrontBanner(){
    return(
        
        <div className="Bannerdisplay">
            <div style={{width:"180vh",height:"150px",boxShadow:"0 0 5px gray",borderRadius:"5px",display:"flex",alignItems:"center",flexDirection:"column",justifyContent:"center",marginTop:"10px"}}>
               <h1 style={{color: "black",fontSize:"30px"}}>Welcome Librarian. Manage Your Library Efficiently!</h1> 
               <h2 style={{color: "black"}}>Organize, Track, and Serve with Ease.</h2> 
              
               <button>Manage Library Resources</button> 
            </div>
        </div>
    )
}
export default FrontBanner;