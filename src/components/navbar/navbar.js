import React from 'react';
import './navbar.css';
import {Link} from 'react-scroll';
import contactImg from '../../assets/contact.png';

const Navbar = () => {
  return (
    <nav className='navbar'>
        <span className ="logo">PRANJAL</span>
        <div className='desktopMenu'>
            <Link to="home" spy={true} smooth={true} offset={-70} duration={500} className='desktopMenuListItem'>Home</Link>
            <Link to="about" spy={true} smooth={true} offset={-70} duration={500} className='desktopMenuListItem'>About</Link>
            <Link to="portfolio" spy={true} smooth={true} offset={-70} duration={500} className='desktopMenuListItem'>Portfolio</Link>
            <Link to="clients" spy={true} smooth={true} offset={-70} duration={500} className='desktopMenuListItem'>Clients</Link>
        </div>
        <button className="desktopBtn">
            <img src={contactImg} alt="contactimg" className="desktopMenuImg"/> Contact Me
        </button>
    </nav>
  )
}

export default Navbar