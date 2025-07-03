import "../App.css"
import { Link } from "react-router-dom";
export function LandingPage(){
    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navheader">
                    <h2>Ping Me</h2>
                </div>
                <div className="navlist">
                    <p>Join as a guest</p>
                    <p>Register</p>
                    <div role="button">
                        <p>Login</p>
                    </div>
                </div>
            </nav>
            
            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color: "orange"}}>Connect</span> with your Loved Ones</h1>
                    <p>Cover a distance by PingMe</p>
                    <div role="button">
                        <Link to={'/home'}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png" />
                </div>
            </div>


        </div>
    );
}