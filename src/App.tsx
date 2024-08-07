import { FunctionComponent } from "react";
import "./App.css";
import Footer from "./components/Footer";
import Index from ".";
import Header from "./components/Header";

const App: FunctionComponent = () => {
  return (
    <div className="main-container">
      <Header />
      <Index />
      <Footer info={true} />
    </div>
  );
};

export default App;