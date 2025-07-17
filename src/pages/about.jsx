/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

﻿import React from "react";

export const About = (props) => {
  return (
    <div id="about">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-6">
            {" "}
            <img src="img/about.jpg" className="img-responsive" alt="About page image" />
          </div>
          <div className="col-xs-12 col-md-6">
            <div className="about-text">
              <h2>About Us</h2>
              <p>{props.data ? props.data.paragraph : "loading..."}</p>
              <h3>Why Choose Us?</h3>
              <div className="list-style">
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul>
                    {props.data
                      ? props.data.Why.map((d, i) => (
                          <li key={`${d}-${i}`}>{d}</li>
                        ))
                      : "loading"}
                  </ul>
                </div>
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul>
                    {props.data
                      ? props.data.Why2.map((d, i) => (
                          <li key={`${d}-${i}`}> {d}</li>
                        ))
                      : "loading"}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sample data props to use with the component:
const aboutData = {
  paragraph: `Established under the Tribal Land Act of 1968, Botswana Landboards are statutory bodies responsible for the administration of tribal land, covering approximately 71% of Botswana's territory (Ministry of Land Management, 2023). We serve as custodians of communal land resources, balancing traditional land tenure systems with modern land management practices. Our mandate includes land allocation, dispute resolution, and sustainable resource management while promoting equitable access for all citizens. Recently empowered by the Tribal Land (Amendment) Act of 2020, we've enhanced digital services and community participation mechanisms.`,
  Why: [
    "Decades of land governance experience",
    "Community-driven decision making",
    "Transparent allocation processes",
    "Digitized land records system"
  ],
  Why2: [
    "Multi-stakeholder dispute resolution",
    "Environmental conservation focus",
    "Gender-balanced representation",
    "Mobile outreach services"
  ]
};

// Usage: <About data={aboutData} />