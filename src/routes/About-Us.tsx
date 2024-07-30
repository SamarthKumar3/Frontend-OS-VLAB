import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './About.css';

const About = () => {
    return (
        <>
            <Header />
            <div className='heroSection'>
                <img src="assets\cintel.jpg" alt="Lab Picture" />
            </div>
            <div className='labDescription'>
                <h2>About Our Department</h2>
                <p>The Department of <b>Computational Intelligence</b> is an educational milieu that creates a foreground
                    for students to acquire knowledge in the futuristic areas of Artificial Intelligence, Machine Learning
                    and Software Engineering. We strive to create students ready for the industry with the ability to
                    develop and sustain space-age systems.</p>
                <p>The curriculum’s prime focus is to endorse learning through the key concepts of acquire, analyze, design,
                    and implement oriented teaching, which will create the students’ ability to challenge, innovate, and
                    compete with assigned Capstone projects to solve real-world problems to make themselves industry ready
                    professionals and enable them to become future entrepreneurs. With no lid to cap your creative genius,
                    the Department of Computational Intelligence brings you forth all the means to implement and take
                    advantage of a wide variety of emerging cutting-edge technologies in software systems or simply be the
                    mastermind behind it all.</p>
                <div className="bullet">
                    <ul>
                        <li> <b>Vision:</b> To build a world-renowned academic platform in Computational Intelligence by
                            providing unique learning and research experiences in collaboration with industries and
                            world-class universities.</li>
                        <li> <b>Mission:</b>To envision in creating, acquiring, and disseminating engineering knowledge on
                            computational intelligence to elevate a student into a professional by imparting knowledge on
                            mathematics, computing sciences, artificial intelligence, and software engineering along with
                            the skills of cognitive computing.</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default About;