import React from "react";
import KyuLogo from '/src/assets/images-removebg-preview.png';
import './SideBar.css'

function SideBar(){
    return(
        <div className="side">
            <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                <img src={KyuLogo} alt="" className="KyuLogo" />
            </div>
        
                
                <h1 style={{fontSize:"15px",textAlign:"center",color:"black",marginBottom:"20px",fontWeight:"bold"}}> LibrarianDashboard</h1>
                    <hr />
            <div className="sidelinks">
                <i class="fa-solid fa-house-user" id="librarian-icon-sidebar"></i>
                <a href="">Dashboard</a>
            </div>

            <div className="sidelinks">
                <i class="fa-solid fa-book-open" id="librarian-icon-sidebar"></i>
                <a href="">Books Available</a>
            </div>

            <div className="sidelinks">
                <i class="fa-solid fa-tower-observation" id="librarian-icon-sidebar"></i>
                <a href="">Reservations</a>
            </div>

            <div className="sidelinks">
                <i class="fa-solid fa-computer" id="librarian-icon-sidebar"></i>
                <a href="">Circulation Desk</a>
            </div>

            <div className="sidelinks">
                <i class="fa-solid fa-warehouse" id="librarian-icon-sidebar"></i>
                <a href="">Inventory</a>
            </div>

            <div className="sidelinks">
                <i class="fa-solid fa-chart-simple" id="librarian-icon-sidebar"></i>
                <a href="">Reports and Analytics</a>
            </div>

            <div className="sidelinks">
                <i class="fa-solid fa-circle-info" id="librarian-icon-sidebar"></i>
                <a href="">logout</a>
            </div>
            <hr />
            <div style={{color:"black"}}>
                <h2>librarian@gmail.com</h2>
            </div>
        </div>
    )
}
export default SideBar;