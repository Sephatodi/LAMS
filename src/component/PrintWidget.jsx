/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// src/components/PrintWidget.js
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';
import Print from '@arcgis/core/widgets/Print';

export function setupPrint(view) {
  // Create the main print template
  const printTemplate = new PrintTemplate({
    format: "PDF",
    layout: "MAP_ONLY",
    layoutOptions: {
      titleText: "Botswana Land Board Map",
      authorText: "National Land Management System",
      copyrightText: `© ${new Date().getFullYear()} Government of Botswana`
    },
    exportOptions: {
      dpi: 300
    }
  });

  // Initialize the Print widget
  const print = new Print({
    view: view,
    printServiceUrl: process.env.VITE_ARCGIS_PRINT_SERVICE_URL,
    template: printTemplate
  });

  // Add the Print widget to the view UI
  view.ui.add(print, "top-right");

  // Create additional print templates
  const legalTemplate = new PrintTemplate({
    name: "legal",
    label: "Legal Document (A4)",
    layout: "A4 Landscape",
    format: "PDF",
    layoutOptions: {
      titleText: "Land Parcel Document",
      customTextElements: [
        { 
          title: "Parcel Details",
          content: "Official land parcel document"
        }
      ]
    }
  });

  const fieldMapTemplate = new PrintTemplate({
    name: "field-map",
    label: "Field Map (A3)",
    layout: "A3 Portrait",
    format: "PDF",
    layoutOptions: {
      scalebarUnit: "metric"
    }
  });

  // Set all available templates
  print.templates = [printTemplate, legalTemplate, fieldMapTemplate];

  // Add event handlers for print operations
  print.on("print-start", function() {
    console.log("Print operation started");
  });

  print.on("print-complete", function(event) {
    console.log("Print operation completed", event);
    // You could add additional handling here like:
    // - Downloading the printed document automatically
    // - Showing a success message to the user
    // - Logging the print operation
  });

  print.on("print-error", function(error) {
    console.error("Print error:", error);
    // Handle print errors here
    // - Show error message to user
    // - Log the error for debugging
  });

  // Add helper methods for common print operations
  print.printLegalDocument = function(additionalOptions) {
    return this.print({
      template: legalTemplate,
      ...additionalOptions
    });
  };

  print.printFieldMap = function(additionalOptions) {
    return this.print({
      template: fieldMapTemplate,
      ...additionalOptions
    });
  };

  // Return the configured print widget
  return print;
}

// Helper function to create a custom print template
export function createCustomPrintTemplate(options) {
  return new PrintTemplate({
    format: options.format || "PDF",
    layout: options.layout || "MAP_ONLY",
    layoutOptions: {
      titleText: options.title || "Custom Map Print",
      authorText: options.author || "",
      copyrightText: options.copyright || "",
      ...options.layoutOptions
    },
    exportOptions: {
      dpi: options.dpi || 300,
      ...options.exportOptions
    }
  });
}

// Utility function to get all available print templates
export function getPrintTemplates() {
  return [
    {
      name: "default",
      label: "Default Map Print",
      description: "Standard map print output"
    },
    {
      name: "legal",
      label: "Legal Document",
      description: "A4 landscape format for legal documents"
    },
    {
      name: "field-map",
      label: "Field Map",
      description: "A3 portrait format for field maps"
    }
  ];
}