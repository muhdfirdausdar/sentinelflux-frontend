// Loading component
import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={`${styles.loadingContainer} ${styles[size]}`}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default Loading;
