import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">🎟️ FlickTickets</div>
      <section className="search-section">
        <input type="text" placeholder="Search" className="search-bar" />
      </section>
      <nav className="nav">
        <a href="#">Movies</a>
        <a href="#">Sports</a>
        <a href="#">Concerts</a>
        <a href="#">Comedy</a>
        <a href="#">Plays</a>
      </nav>
      <div className="icons">
        <span role="img" aria-label="search">🔍</span>
        <span role="img" aria-label="user">👤</span>
        <span role="img" aria-label="menu">☰</span>
      </div>
    </header>
  );
};

export default Header;
