import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-us-container">
            <div className="about">
                <img src="/picture/SentinelFlux Logo.png" alt="SentinelFlux project logo" className="overlay-image" />
                <img src="/picture/vision.png" alt="Vision illustration" className="sub-image" />
            </div>

            <section className="team">
                <h2 className="team-title">Who We Are</h2>
                <p className="team-subtitle">It Started with a Question: How Do We Track the Untrackable?</p>
                
                <div className="team-container">   
                    {/* Card 1 */}
                    <div className="team-card">
                        <img src="/picture/hafizudin.png" alt="Muhammad Hafizudin" className="team-img" />
                        <h3 className="team-name">Muhammad Hafizudin</h3>
                        {/* Social Media Logos as images */}
                        <div className="team-socials">
                            <a href="https://facebook.com/yourprofile" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/facebook.png" alt="Facebook" className="social-icon" />
                            </a>
                            <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/instagram.png" alt="Instagram" className="social-icon" />
                            </a>
                            <a href="https://www.linkedin.com/in/hafizudinjamhari" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/linkedin.png" alt="LinkedIn" className="social-icon" />
                            </a>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="team-card">
                        <img src="/picture/firdaus.png" alt="Muhammad Firdaus" className="team-img" />
                        <h3 className="team-name">Muhammad Firdaus</h3>
                        {/* Social Media Logos as images */}
                        <div className="team-socials">
                            <a href="https://facebook.com/yourprofile" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/facebook.png" alt="Facebook" className="social-icon" />
                            </a>
                            <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/instagram.png" alt="Instagram" className="social-icon" />
                            </a>
                            <a href="https://www.linkedin.com/in/muhammad-firdaus-darmawan-124545243" target="_blank" rel="noopener noreferrer">
                                <img src="/icons/linkedin.png" alt="LinkedIn" className="social-icon" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mission-vision">
                {/* Mission */}
                <div className="mv-card">
                    <h3 className="mv-title mission">Our Mission</h3>
                    <p className="mv-text">
                        Our mission is to make cyber threats more transparent and traceable by providing
                        intuitive visual tools and up-to-date analytics on Fast Flux behavior.
                    </p>
                </div>

                {/* Vision */}
                <div className="mv-card">
                    <h3 className="mv-title vision">Our Vision</h3>
                    <p className="mv-text">
                        To empower the cybersecurity community with intelligent, real-time visibility into evolving Fast Flux threats—
                        making the internet safer through transparency, research, and innovation.
                    </p>
                </div>
            </section>

            <section className="data-sources">
                <div className="data-text">
                    <h2>Our Data Sources</h2>
                    <p>
                        The accuracy and effectiveness of SentinelFlux rely on real-world, constantly updated data. 
                        Our platform integrates multiple public and community-driven datasets to collect domain names and perform dig/lookup in order to detect and visualize 
                        Fast Flux:
                    </p>
                </div>
                
                <div className="data-logos">
                    <div className="logo-row">
                        <a href="https://threatfox.abuse.ch" target="_blank" rel="noopener noreferrer">
                            <img src="/logos/threatfox_logo.svg" alt="ThreatFox Logo" />
                        </a>
                        <a href="https://www.kaggle.com" target="_blank" rel="noopener noreferrer">
                            <img src="/logos/Kaggle.png" alt="Kaggle Logo" />
                        </a>
                        <a href="https://urlhaus.abuse.ch" target="_blank" rel="noopener noreferrer">
                            <img src="/logos/urlhaus_logo.svg" alt="URLhaus Logo" />
                        </a>
                    </div>
                    <div className="logo-row">
                        <a href="https://phishtank.org" target="_blank" rel="noopener noreferrer">
                            <img src="/logos/phishtank.png" alt="PhishTank Logo" />
                        </a>
                    </div>
                </div>
            </section>

            <section className="acknowledgment" id="acknowledgment">
                <div className="ack-content">
                    <h2>Acknowledgment</h2>
                    <p>
                        We would like to express our heartfelt gratitude to all those who contributed to the development 
                        and success of SentinelFlux.
                    </p>
                    <p>
                        We are thankful to our supervisor, Dr. Andi Fitriah Abdul Kadir, for her exceptional guidance, 
                        constructive feedback, and continuous support throughout the project to achieve perfect quality 
                        in the work involved in this research. Our appreciation goes to our family and friends for their 
                        limitless support, prayers, and encouragement. They have proven to be our greatest inspiration 
                        during this challenging moment through their sheer belief in our dreams and abilities.
                    </p>
                    <p>
                        In addition, our thanks go to fellow Kulliyyah Of Information And Communication Technology students, 
                        and all those who offered advice, critiques, and technical assistance, making a significant 
                        contribution toward the development of this project. The various contributions made a difference 
                        in improving efficiency of implementation and completion of this project.
                    </p>
                    <p>
                        Finally, International Islamic University Malaysia deserves much gratitude as they provided the 
                        facilities and opportunities for making this stage of our Final Year Project successful.
                    </p>
                    <h3>"THIS PROJECT STANDS AS A REFLECTION OF COLLABORATION, LEARNING, AND THE SPIRIT OF OPEN RESEARCH IN THE FIGHT AGAINST CYBER THREATS."</h3>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
