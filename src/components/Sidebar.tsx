import { FunctionComponent, useState } from "react";
import './Sidebar.css';
import Header from "./Header";
import Introduction from "../static/Introduction.json";
import Objective from "../static/Objective.json";
// import ListOfExperiments from "../static/ListOfExperiments.json";
import Feedback from "../static/Feedback.json";
// import { Link } from "react-router-dom";

const ContactTabFrame: FunctionComponent = () => {
    const [textToDisplay, setTextToDisplay] = useState<String>("");
    const [selectedFrame, setSelectedFrame] = useState<string | null>('Introduction');

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const text = target.textContent;
        setSelectedFrame(text);
        if (text) {
            switch (text) {
                case "Introduction":
                    setTextToDisplay(Introduction.content);
                    break;
                case "Objective":
                    setTextToDisplay(Objective.content);
                    break;
                case "List of experiments":
                    setTextToDisplay("");
                    break;
                case "Feedback":
                    setTextToDisplay(Feedback.content);
                    break;
                default:
                    setTextToDisplay(Introduction.content);
                    break;
            }
        }
    }

    return (
        <section className="contact-tab-frame">
            <Header />
            <div className="main-frame">
                <div className="child-frame">
                    <div className="operating-system">{`Operating System `}</div>
                </div>
                <div className="parent-text-frame">
                    <div className="ndhu-csie-junior-project">
                        <div className="os-frame">
                            <div className="intro-obj-fed-frame">
                                <div className='introduction1' onClick={handleClick}><p className={`${selectedFrame === 'Introduction' ? 'selected-frame' : ''}`}>Introduction</p></div>
                                <div className="objective" onClick={handleClick}><p className={`${selectedFrame === 'Objective' ? 'selected-frame' : ''}`}>Objective</p></div>
                                <div className="objective-frame">
                                    <div className="list-of-experiments" onClick={handleClick}><p className={`${selectedFrame === 'List of experiments' ? 'selected-frame' : ''}`}>List of experiments</p></div>
                                </div>
                                <div className="feedback" onClick={handleClick}><p className={`${selectedFrame === 'Feedback' ? 'selected-frame' : ''}`}>Feedback</p></div>
                            </div>
                        </div>
                        <div className="parent-frame">
                            <div className="title" />
                        </div>
                    </div>
                    <div className="title-text">
                        <div className="korem-ipsum-dolor">
                            {textToDisplay.text || Introduction.content}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactTabFrame;