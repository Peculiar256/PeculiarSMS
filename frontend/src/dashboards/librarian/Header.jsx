import React from "react"; 
import librarianPic from '/src/assets/kj.jpeg'

function Header(){
    return (
        <header style={{backgroundColor:"#2c4ebb",width:"100%",height:"60px",display:"flex",alignItems:"center",justifyContent:"space-between",marginRight:"10px",padding:"20px"}}>
            <h1 style={{color:"white"}}>SMS</h1>
            <img src={librarianPic} alt="" style={{ width:"50px",height:"50px",backgroundColor:"white",borderRadius:"50%"}} />
        </header>
    )
}
export default Header;