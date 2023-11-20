import Navbar from "./components/navbar/navbar";
import Intro from "./components/intro/intro";
import Footer from "./components/footer/footer";
import Contact from "./components/contact/contact";
import About from "./components/about/about";
import Portfolio from "./components/portfolio/portfolio";

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Intro/>
      <About/>
      <Portfolio/>
      <Contact/>
      <Footer/>
    </div>
  );
}

export default App;
