import { FunctionComponent } from 'react';
import './Contact.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact: FunctionComponent = () => {
    return (
        <>
            <Header />
            <div className='heroSection'>
                <img src="assets\cintel.jpg" alt="Contact Us image" />
            </div>
            <div className="contact-container">
                <p className="contact-info">Our team is ready to answer your queries. Feel free to reach out to us:</p>
                <div className="contact-info">
                    <div>
                        <strong>Email:</strong> infodesk@srmist.edu.in
                    </div>
                    <div>
                        <strong>Phone:</strong> +91-44- 27417000, +91-44-27417777
                    </div>
                    <div>
                        <strong>Address:</strong> SRM Nagar, Kattankulathur - 603 203
                        Chengalpattu District, Tamil Nadu.
                    </div>
                    <div>
                        <strong>Follow us on social media:</strong>
                        <p>
                            <a href="https://www.facebook.com/SRMUniversityOfficial">Facebook</a> |
                            <a href="https://twitter.com/SRM_Univ">Twitter</a> |
                            <a href="https://www.instagram.com/SRMUniversityOfficial/">Instagram</a>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Contact;