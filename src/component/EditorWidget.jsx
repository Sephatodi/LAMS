/** @jsxRuntime classic */
/** @jsx React.createElement */

// src/components/EditorWidget.js
// With these
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Editor from '@arcgis/core/widgets/Editor';
import FeatureForm from '@arcgis/core/widgets/FeatureForm';
import Sketch from '@arcgis/core/widgets/Sketch';
import { landParcelLayer } from './LandParcelLayer';

export function setupEditor(view) {
  // Configure the editor widget
  const editor = new Editor({
    view: view,
    layerInfos: [{
      layer: landParcelLayer,
      enabled: true,
      addEnabled: true,
      updateEnabled: true,
      deleteEnabled: true,
      geometryUpdatesEnabled: true,
      formTemplate: {
        elements: [{
          type: "field",
          fieldName: "ParcelID",
          label: "Parcel ID",
          editable: false // Make ID non-editable
        }, {
          type: "field",
          fieldName: "Owner",
          label: "Owner Name",
          required: true
        }, {
          type: "field",
          fieldName: "ContactNumber",
          label: "Contact Number",
          domain: {
            type: "range",
            name: "PhoneNumbers",
            min: 1000000000,
            max: 9999999999
          }
        }, {
          type: "field",
          fieldName: "Area",
          label: "Area (sqm)",
          required: true
        }, {
          type: "field",
          fieldName: "Zoning",
          label: "Zoning Type",
          domain: {
            type: "coded-value",
            name: "ZoningTypes",
            codedValues: [
              { name: "Residential", code: "Residential" },
              { name: "Commercial", code: "Commercial" },
              { name: "Agricultural", code: "Agricultural" },
              { name: "Protected", code: "Protected" }
            ]
          }
        }, {
          type: "field",
          fieldName: "Status",
          label: "Parcel Status",
          domain: {
            type: "coded-value",
            name: "StatusTypes",
            codedValues: [
              { name: "Active", code: "Active" },
              { name: "Pending", code: "Pending" },
              { name: "Inactive", code: "Inactive" }
            ]
          }
        }]
      }
    }],
    snappingOptions: {
      enabled: true,
      selfEnabled: true,
      featureEnabled: true,
      featureSources: [{ layer: landParcelLayer }]
    }
  });

  // Initialize sketch widget for advanced editing
  const sketch = new Sketch({
    view: view,
    layer: landParcelLayer,
    creationMode: 'update',
    availableCreateTools: ['polygon', 'rectangle'],
    snappingOptions: editor.snappingOptions
  });

  // Add undo/redo functionality
  reactiveUtils.watch(
    () => editor.viewModel?.state,
    (state) => {
      if (state === 'ready') {
        editor.viewModel.undo();
        editor.viewModel.redo();
      }
    }
  );

  // Configure snapping
  view.snappingOptions = {
    enabled: true,
    selfEnabled: true,
    featureEnabled: true,
    featureSources: [{ layer: landParcelLayer }],
    distance: 10
  };

  // Add editor to the UI
  view.ui.add(editor, "top-right");

  // Create custom feature form
  const featureForm = new FeatureForm({
    view: view,
    layer: landParcelLayer,
    container: document.createElement("div"),
    groupDisplay: 'sequential',
    includeNullAttributes: false,
    description: "Edit land parcel details",
    title: "Parcel Information"
  });

  // Event handlers
  editor.on("create", (event) => {
    console.log("Feature created:", event);
    // Additional logic when a feature is created
  });

  editor.on("update", (event) => {
    console.log("Feature updated:", event);
    // Additional logic when a feature is updated
  });

  editor.on("delete", (event) => {
    console.log("Feature deleted:", event);
    // Additional logic when a feature is deleted
  });

  featureForm.on("submit", (event) => {
    console.log("Form submitted:", event);
    // Handle form submission
  });

  // Helper methods
  function startEditing(feature) {
    featureForm.feature = feature;
    view.ui.add(featureForm.container, "top-right");
  }

  function stopEditing() {
    view.ui.remove(featureForm.container);
  }

  function enableAdvancedEditing() {
    view.ui.add(sketch, "top-right");
  }

  function disableAdvancedEditing() {
    view.ui.remove(sketch);
  }

  // Return the editor components and helper methods
  return {
    editor,
    featureForm,
    sketch,
    startEditing,
    stopEditing,
    enableAdvancedEditing,
    disableAdvancedEditing,
    getCurrentState: () => editor.viewModel.state,
    getActiveTool: () => editor.viewModel.activeTool
  };
}

// Helper function to create custom editor configurations
export function createEditorConfig(layer, options = {}) {
  return {
    layer: layer,
    enabled: options.enabled !== false,
    addEnabled: options.addEnabled !== false,
    updateEnabled: options.updateEnabled !== false,
    deleteEnabled: options.deleteEnabled !== false,
    geometryUpdatesEnabled: options.geometryUpdatesEnabled !== false,
    formTemplate: options.formTemplate || null,
    snappingEnabled: options.snappingEnabled !== false
  };
}

export default EditorWidget();