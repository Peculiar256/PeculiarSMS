import React from "react";
import Header from "./Header";
import SideBar from "./SideBar";
import FrontBanner from "./FrontBanner";
import LibrarianCards from "./LibrarianCards";
import PieChart from "./PieChart";
import LibrarianActions from "./LibrarianActions";


 function LibririanDashboard(){
    return(

            <div>
                <Header/>
                <div style={{display:"flex"}}>
                    <SideBar/>
                   <div style={{marginLeft:"20px"}}>
                        <FrontBanner/>
                        <LibrarianCards/>
                        <div style={{display:"flex"}}>
                            <LibrarianActions/>
                            <PieChart/>
                        </div>
                   </div>
                </div>
            </div>
            
    )
}
export default LibririanDashboard;