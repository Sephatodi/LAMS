/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

const FormStep = ({ children, title }) => {
    return (
      <div className={styles.formStep}>
        <h3 className={styles.stepHeader}>{title}</h3>
        <div className={styles.stepContent}>
          {children}
        </div>
      </div>
    );
  };
  
  export default FormStep;