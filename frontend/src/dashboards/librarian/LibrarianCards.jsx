import React from "react";
import './LibrarianCards.css'

function LibrarianCards(){

    return(
        <div style={{display:"flex",gap:"17px",marginTop:"20px"}}>

               <div className="librarycardview">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"30px"}}>
                       <h1>Total Books</h1>
                       <i class="fa-solid fa-book-open" style={{width:"35px",height:"35px",border:"1px solid blue",borderRadius:"50%",display:"grid",placeItems:"center",color:"#2c4ebb"}}></i>
                  </div>
                  <p>225</p> 
               </div>

               <div className="librarycardview">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"30px"}}>
                       <h1>Books Borrowed</h1>
                       <i class="fa-solid fa-computer " style={{width:"35px",height:"35px",border:"1px solid green",borderRadius:"50%",display:"grid",placeItems:"center",color:"green"}}></i>
                  </div>
                  <p>188</p> 
               </div>

               <div className="librarycardview">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"30px"}}>
                       <h1>Overdue Books</h1>
                       <i class="fa-solid fa-circle-question" style={{width:"35px",height:"35px",border:"1px solid orange",borderRadius:"50%",display:"grid",placeItems:"center",color:"orange"}}></i>
                  </div>
                  <p>10</p> 
               </div>

               <div className="librarycardview">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"30px"}}>
                       <h1>New Arrivals</h1>
                       <i class="fa-solid fa-calendar" style={{width:"35px",height:"35px",border:"1px solid #2c4ebb",borderRadius:"50%",display:"grid",placeItems:"center",color:"#2c4ebb"}}></i>
                  </div>
                  <p>24</p> 
               </div>

                <div className="librarycardview">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"30px"}}>
                       <h1>inventory</h1>
                       <i class="fa-solid fa-warehouse" style={{width:"35px",height:"35px",border:"1px solid green",borderRadius:"50%",display:"grid",placeItems:"center",color:"green"}}></i>
                  </div>
                  <p>225</p> 
               </div>
            
        </div>
    )
}
export default LibrarianCards;