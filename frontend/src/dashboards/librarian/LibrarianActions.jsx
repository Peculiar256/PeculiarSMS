import React from "react";
import './LibrarianActions.css'

function LibrarianActions(){
    return(
        <div className="library-actions">
            <h1>Quick Actions</h1>

            <div className="library-buttons">
                <button>Add New Books</button>
            </div>

            <div className="library-buttons02">
                <button>Process Returns</button>
            </div>

            <div className="library-buttons03">
                <button>View Overdue Books</button>
            </div>

            <div className="library-buttons04">
                <button>Generate Reports</button>
            </div>
        </div>
    )
}
export default LibrarianActions;