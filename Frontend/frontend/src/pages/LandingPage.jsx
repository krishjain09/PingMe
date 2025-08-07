import { use } from "react";
import "../App.css"
import { Link , useNavigate} from "react-router-dom";

export function LandingPage(){
    const router = useNavigate();
    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navheader">
                    <h2>Ping Me</h2>
                </div>
                <div className="navlist">
                    <p onClick={() => router('/home')}>
                        Join as a guest
                    </p>
                    <p onClick={() => router('/auth')}>
                        Register
                    </p>
                    <div role="button" onClick={() => router('/auth')}>
                        <p>Login</p>
                    </div>
                </div>
            </nav>
            
            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color: "orange"}}>Connect</span> with your Loved Ones</h1>
                    <p>Cover a distance by PingMe</p>
                    <div role="button">
                        <Link to={'/auth'}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png" />
                </div>
            </div>


        </div>
    );
}