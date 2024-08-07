import { FunctionComponent } from "react";
import './Footer.css';

interface FooterProps {
  info?: Boolean;
}

const Footer: FunctionComponent<FooterProps> = ({ info }) => {
  return (
    <footer className="bottom" id="footer">
      <div className={`background-rectangle ${info ? '' : 'solid-rect'}`}>
        {info ?
          <>
            <div className="footer-content-left">
              <img src="/static/SRM_map.png" className="footer-img" alt="SRMIST Logo" />
            </div>
            <div className="footer-divider"></div>
            <div className="footer-content-right">
              <div className="contact-us">
                <h1>Contact us</h1>
                <p>Department Of Computational Intelligence<br />
                  Univeristy Block,<br />
                  SRM Institute of Science and Technology,Kattankulathur – 603203</p>
                <p><i className="fas fa-phone"></i>&nbsp; 044 27417838/044 27417878</p>
                <a href="mailto:hod.cintel.ktr@srmist.edu.in"><i className="fas fa-envelope-open"></i> &nbsp;hod.cintel.ktr@srmist.edu.in</a>
              </div>
            </div>
          </>
          :
          null
        }

      </div>
    </footer>
  )
}

export default Footer;