import React from 'react';
import styles from './Footer.module.css';


const Footer = () => (
    <footer className={styles.footer}>
        <div className="flex flex-col w-full p-4 gap-2">
            <p className='text-[0.7rem] font-semibold md:text-base'>Developed by Muhammad Firdaus and Muhammad Hafizudin | Contact: sentinelfastflux@gmail.com</p>
            <p className='text-[0.65rem] font-light md:text-base'>Bachelor of Computer Science, Final Year Project, International Islamic University Malaysia</p>
            <p className='text-[0.6rem] font-extralight md:text-base'>© 2025 SentinelFlux - A Tool for Fast Flux Analysis & Visualization. All rights reserved.</p>
        </div>
    </footer>
);

export default Footer;
