import React from 'react';
import './intro.css';
import bg from '../../assets/myImg.jpg';
import btnImg from '../../assets/WhatsApp_Image_2023-11-02_at_23.55.42-removebg-preview.png';
import {Link} from 'react-scroll';

const resumeURL = process.env.PUBLIC_URL + '/myResume.pdf';

const Intro = () => {
    const downloadFileAtURL = (url) => {
        const fileName = url.split("/").pop();
        const aTag =  document.createElement("a");
        aTag.href = url;
        aTag.setAttribute("download",fileName);
        document.body.appendChild(aTag);
        aTag.click();
        aTag.remove();
    };
  return (
    <section id="intro">
        <div className="introContent">
            <span className="hello">Hello,</span>
            <span className="introText">I'm <span className="introName">Pranjal Arora</span><br/> Software Developer</span>
            <p className="introPara"> B.Tech CSE Graduate <br/> IIT(ISM) Dhanbad</p>
            <Link><button className="btn" onClick={()=>{downloadFileAtURL(resumeURL)}}><img className="btnImg" src={btnImg} alt="Download Resume"></img>Resume</button></Link>

        </div>
        <img src= {bg} alt="bgImg" className="bg"/>
    </section>
  )
}

export default Intro