/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

﻿// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "plot": "Plot",
      "status": "Status",
      "owner": "Owner"
    }
  },
  tn: {
    translation: {
      "plot": "Sebaka",
      "status": "Maemo",
      "owner": "Mong"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tn', // Default to Setswana
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;