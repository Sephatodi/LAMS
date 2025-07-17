/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

﻿import { useState } from "react";
import emailjs from '@emailjs/browser';
import React from "react";

const initialState = {
  name: "",
  email: "",
  message: "",
};
export const Contact = (props) => {
  const [{ name, email, message }, setState] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };
  const clearState = () => setState({ ...initialState });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs
      .sendForm("LAND_SERVICE_ID", "LAND_TEMPLATE_ID", e.target, "LAND_PUBLIC_KEY")
      .then(
        (result) => {
          console.log(result.text);
          clearState();
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    <div>
      <div id="contact">
        <div className="container">
          <div className="col-md-8">
            <div className="row">
              <div className="section-title">
                <h2>Contact Botswana Land Services</h2>
                <p>
                  {props.data ? props.data.description : "loading..."}
                </p>
              </div>
              <form name="sentMessage" validate onSubmit={handleSubmit}>
                {/* Form inputs remain same */}
              </form>
            </div>
          </div>
          <div className="col-md-3 col-md-offset-1 contact-info">
            <div className="contact-item">
              <h3>Landboard Offices</h3>
              <p>
                <span><i className="fa fa-map-marker"></i> Headquarters</span>
                {props.data ? props.data.address : "loading"}
              </p>
              <p className="regional-offices">
                {props.data ? props.data.regionalOffices : "loading"}
              </p>
            </div>
            {/* Other contact items */}
          </div>
          {/* Social media section */}
        </div>
      </div>
      <div id="footer">
        <div className="container text-center">
          <p>
            &copy; {new Date().getFullYear()} Botswana Landboard Services. 
            <a href="https://www.gov.bw/mlnp" target="_blank" rel="noopener noreferrer">
              Ministry of Lands
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Sample data props
const contactData = {
  description: `Reach Botswana's Landboard Services for land allocation inquiries, plot disputes, or tribal land administration. Our offices operate Monday-Friday (7:30 AM - 4:30 PM) per Government Directive Circular No.2 of 2022. All communications are handled under the Tribal Land Act Section 18 confidentiality provisions.`,
  address: "Ministry of Lands, Private Bag 004, Government Enclave, Gaborone",
  regionalOffices: "12 District Landboards | 5 Sub-landboards | 13 Tribal Administration Offices",
  phone: "+267 395 3200 (Main) | +267 0800 600 007 (Hotline)",
  email: "landservices@gov.bw",
  facebook: "https://facebook.com/BotswanaLands",
  twitter: "https://twitter.com/BotswanaLands",
  youtube: "https://youtube.com/BotswanaGovLands"
};

// Usage: <Contact data={contactData} />