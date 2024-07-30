import { FunctionComponent } from "react";
import "./App.css";
import Footer from "./components/Footer";
import Index from ".";
import Header from "./components/Header";

const Introduction: FunctionComponent = () => {
  return (
    <div className="main-container">
      <Header />
      <Index />
      <Footer />
    </div>
  );
};

export default Introduction;