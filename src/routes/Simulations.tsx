import './Simulations.css'
import { Link } from 'react-router-dom'

import ListOfExperiments from '../static/ListOfExperiments.json';
import Footer from '../components/Footer';
import Header from '../components/Header';

const Simulations = () => {
    return (
        <>
        <Header/>
        <div className='cardList'>
            {ListOfExperiments.map(experiment => {
                return <div className='exp-card' key={experiment.id}>
                    <h3 className='experimentName'>
                        {experiment.title}
                    </h3>
                    <p className='experimentDescription'>
                        {experiment.description}
                    </p>
                    <Link to={`/${experiment.link}`}
                        style={{ "display": "flex", "justifyContent": "center", "padding": "1rem", "textDecoration": "none" }}>
                        <button className="button-sm">Practice Experiment</button>
                    </Link>
                </div>
            }) 
        }
        </div>
        <Footer/>
        </>
    )
}

export default Simulations