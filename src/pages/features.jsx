/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

﻿import React from "react";
import {
  Receipt as ReceiptIcon,
  Gavel as LawIcon,
  Description as FormIcon,
  Videocam as VideoIcon,
  Timeline as TimelineIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Map as MapIcon,
  AccountBalance as AccountBalanceIcon,
  Update as UpdateIcon,
  Chat as ChatIcon,
  MobileFriendly as MobileIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

export const Features = (props) => {
  return (
    <div id="features" className="text-center">
      <div className="container">
        <div className="col-md-10 col-md-offset-1 section-title">
          <h2>Land Services Features</h2>
          <p>Comprehensive digital solutions for Botswana land administration</p>
        </div>
        <div className="row">
          {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.title}-${i}`} className="col-xs-6 col-md-3">
                  {d.icon}
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              ))
            : "Loading..."}
        </div>
      </div>
    </div>
  );
};

// Sample features data for Botswana Landboard
const featuresData = [
  {
    icon: <ReceiptIcon fontSize="large" color="primary" />,
    title: "Certificate Services",
    text: "Replace lost/damaged land certificates with police affidavit integration (Land Act Section 12.4)"
  },
  {
    icon: <AccountBalanceIcon fontSize="large" color="primary" />,
    title: "Inheritance Processing",
    text: "Digital transfer of land rights with Bogosi integration and Form 407 submission"
  },
  {
    icon: <LawIcon fontSize="large" color="primary" />,
    title: "Land Conversion",
    text: "Customary to Common Law conversion with online payment (P150 + fees)"
  },
  {
    icon: <MapIcon fontSize="large" color="primary" />,
    title: "Plot Applications",
    text: "Apply for residential/agricultural plots with digital map integration"
  },
  {
    icon: <FormIcon fontSize="large" color="primary" />,
    title: "Digital Forms",
    text: "17+ online forms including Transfer of Land Rights and Conversion Applications"
  },
  {
    icon: <TimelineIcon fontSize="large" color="primary" />,
    title: "Process Tracking",
    text: "Real-time status updates for all land applications"
  },
  {
    icon: <VideoIcon fontSize="large" color="primary" />,
    title: "Video Guides",
    text: "Step-by-step tutorials for complex processes like inheritance transfers"
  },
  {
    icon: <PeopleIcon fontSize="large" color="primary" />,
    title: "Customary Land",
    text: "Manage tribal land grants under Tribal Land Act Section 3.4"
  },
  {
    icon: <UpdateIcon fontSize="large" color="primary" />,
    title: "Law Updates",
    text: "Automatic alerts for legislative changes (2020 Land Act Amendments)"
  },
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: "Document Search",
    text: "GIS-powered land records search with plot history"
  },
  {
    icon: <ChatIcon fontSize="large" color="primary" />,
    title: "24/7 Assistance",
    text: "AI chatbot integrated with Botswana Land Policy 2015 guidelines"
  },
  {
    icon: <MobileIcon fontSize="large" color="primary" />,
    title: "Mobile Access",
    text: "Full service access via USSD and mobile apps"
  }
];

// Usage: <Features data={featuresData} />