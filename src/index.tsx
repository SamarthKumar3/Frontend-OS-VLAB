import React from 'react'

const Index = () => {
    return (
        <>
            <div className="section-1">
                <div className="hero-choice">
                    <button className="button-index" id="abt-dept">About the department</button>
                    <button className="button-index" id="vsn-msn">Vision and Mission</button>
                </div>
                <div className="underline"></div>
                <div className="hero-content">
                    <p>The Department of Computational Intelligence is an educational milieu that creates a foreground
                        for students to acquire knowledge in the futuristic areas of Artificial Intelligence, Machine
                        Learning and Software Engineering. We strive to create students ready for the industry with the
                        ability to develop and sustain space-age systems.
                        The curriculum’s prime focus is to endorse learning through the key concepts of acquire,
                        analyze, design, and implement oriented teaching, which will create the students’ ability to
                        challenge, innovate, and compete with assigned Capstone projects to solve real-world problems to
                        make themselves industry ready professionals and enable them to become future entrepreneurs.
                        With no lid to cap your creative genius, the Department of Computational Intelligence brings you
                        forth all the means to implement and take advantage of a wide variety of emerging cutting-edge
                        technologies in software systems or simply be the mastermind behind it all.</p>
                </div>
                <div className="hero-content">
                    <div>
                        <h2>Vision:</h2>
                        <p>To build a world-renowned academic platform in Computational Intelligence by providing unique
                            learning and research experiences in collaboration with industries and world-className
                            universities.
                        </p>
                    </div>
                    <div>
                        <h2>Mission:</h2>
                        <p>To envision in creating, acquiring, and disseminating engineering knowledge on computational
                            intelligence to elevate a student into a professional by imparting knowledge on mathematics,
                            computing sciences, artificial intelligence, and software engineering along with the skills
                            of cognitive computing.
                            To offer a unique learning environment through world class faculty, curriculum, modernized
                            lab facilities, and an interactive classroom environment with real-time experience from
                            industrial experts that leads to a computing career in the latest technologies.
                            To uplift the innovative research and development in computational intelligence and its
                            allied fields by collaborating with renowned academic institutions and industries.
                            To produce graduates who are global innovators and leaders in the development of
                            computational intelligence-based systems, along with the commitment to ethical
                            responsibilities and lifelong learning.</p>
                    </div>
                </div>
                <div className="underline"></div>
                <h1 className="welcome-heading">Welcome Message</h1>
                <div>
                    <div className="welcome-holder">
                        <img src="/static/Dr.R.-Annie-Uthra.jpg" alt="Dr. R. Annie Uthra, HoD CINTEL Department"
                            className="hod-img" />
                        <p>The Department of Computational Intelligence has taken the initiative to empower each and
                            every one of its students to be confident, diligent, focused, and exceptional. Artificial
                            Intelligence, Machine Learning and Software Development are the unseen fuels that power the
                            world. Our department is committed to developing each student’s potential and achieving
                            global excellence. By embracing various inter-disciplinary streams, we make it possible for
                            each to experiment with their environment. With a faculty of highly experienced and
                            dedicated instructors committed to each student’s growth, we strive to produce engineers of
                            high caliber and make a mark on the world.</p>
                    </div>
                </div>
            </div>

            <div className="section-2">
                <div className="lab-header">
                    <h1>Virtual Labs</h1>
                </div>
                <div className="lab-container">
                    <div className="buttons">
                        <div className="myButton">
                            <p>Operating System</p>
                        </div>
                    </div>
                    <div className="cards">
                        <a href='/Simulations' className="no-decoration card"><img className="card"
                            src="https://placehold.co/600x200" alt="" /></a>
                    </div>
                </div>
            </div>
        </>

    )
}

export default Index;