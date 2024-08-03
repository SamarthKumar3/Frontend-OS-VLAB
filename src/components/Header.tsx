import { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header: FunctionComponent = () => {
    return (
        <nav className="nav">
            <div className="nav-child1">
                <img className="logo-icon" loading="eager" alt="" src="/static/SRM-logo.png" />
                <div className="divider"></div>
                <div className="vlab-header">
                    <h4>Virtual Labs</h4>
                    <h6>Under the department of Computational Intelligence</h6>
                </div>
                <div className="nav-child1-a">
                    <div className="search-bar">
                        <input id="search-input" type="text" placeholder="Search" />
                        <button type="submit" className="search-button"><i className="fa fa-search"></i></button>
                    </div>
                </div>
            </div>
            <div className="nav-child2">
                <div className="nav-tab-frame">
                    <div className="home"><Link to='/' className="no-decoration">Home</Link></div>
                </div>
                <div className="nav-tab-frame">
                    <div className="about-us"><Link to='/About-Us' className="no-decoration">About-Us</Link></div>
                </div>
                <div className="nav-tab-frame">
                    <div className="contact"><Link to='/Contact' className="no-decoration">Contact</Link></div>
                </div>
            </div>

        </nav>
    )
}

export default Header;



