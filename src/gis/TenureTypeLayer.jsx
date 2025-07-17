// /src/gis/TenureTypeLayer.jsx
import { loadModules } from 'esri-loader';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTenureFilter } from '../store/tenureSlice';

const TenureTypeLayer = ({ mapView, layerId }) => {
  const dispatch = useDispatch();
  const tenureFilter = useSelector(state => state.tenure.filter);
  const layerRef = useRef(null);

  useEffect(() => {
    let componentMounted = true;
    let highlightHandler;

    loadModules([
      'esri/layers/FeatureLayer',
      'esri/renderers/UniqueValueRenderer',
      'esri/symbols/SimpleFillSymbol',
      'esri/Graphic',
      'esri/views/layers/LayerView'
    ]).then(([FeatureLayer, UniqueValueRenderer, SimpleFillSymbol, Graphic]) => {
      if (!componentMounted) return;

      // Create tenure type layer
      const layer = new FeatureLayer({
        id: layerId,
        url: "https://services.arcgis.com/your-tenure-service/arcgis/rest/services/TenureTypes/FeatureServer",
        outFields: ["*"],
        renderer: new UniqueValueRenderer({
          field: "TENURE_TYPE",
          uniqueValueInfos: [
            {
              value: "Tribal",
              symbol: new SimpleFillSymbol({
                color: [255, 200, 0, 0.7],
                outline: {
                  color: [255, 150, 0],
                  width: 1
                }
              }),
              label: "Tribal Land"
            },
            {
              value: "State",
              symbol: new SimpleFillSymbol({
                color: [0, 100, 255, 0.7],
                outline: {
                  color: [0, 50, 200],
                  width: 1
                }
              }),
              label: "State Land"
            },
            {
              value: "Freehold",
              symbol: new SimpleFillSymbol({
                color: [0, 200, 100, 0.7],
                outline: {
                  color: [0, 150, 50],
                  width: 1
                }
              }),
              label: "Freehold Land"
            },
            {
              value: "Customary",
              symbol: new SimpleFillSymbol({
                color: [200, 0, 200, 0.7],
                outline: {
                  color: [150, 0, 150],
                  width: 1
                }
              }),
              label: "Customary Rights Area"
            }
          ]
        }),
        popupTemplate: {
          title: "{TENURE_TYPE} Land",
          content: [{
            type: "fields",
            fieldInfos: [
              { fieldName: "TENURE_TYPE", label: "Tenure Type" },
              { fieldName: "LEGAL_BASIS", label: "Legal Basis" },
              { fieldName: "RESTRICTIONS", label: "Use Restrictions" },
              { fieldName: "HISTORY", label: "Historical Background" }
            ]
          }]
        }
      });

      mapView.map.add(layer);
      layerRef.current = layer;

      // Add layer view event handlers
      mapView.whenLayerView(layer).then(layerView => {
        highlightHandler = layerView.on("pointer-move", (event) => {
          layerView.highlight();
          layerView.queryFeatures({
            geometry: event.mapPoint,
            distance: 5,
            units: "meters"
          }).then(({ features }) => {
            if (features.length > 0) {
              const attributes = features[0].attributes;
              dispatch(updateTenureFilter({
                currentHover: attributes.TENURE_TYPE,
                attributes
              }));
            }
          });
        });
      });
    });

    return () => {
      componentMounted = false;
      if (highlightHandler) highlightHandler.remove();
      if (mapView && layerRef.current) {
        mapView.map.remove(layerRef.current);
      }
    };
  }, [mapView, layerId, dispatch]);

  // Apply filter changes
  useEffect(() => {
    if (!layerRef.current) return;

    let whereClause = "1=1";
    if (tenureFilter.selectedTypes.length > 0) {
      whereClause = `TENURE_TYPE IN (${tenureFilter.selectedTypes.map(t => `'${t}'`).join(',')})`;
    }

    layerRef.current.definitionExpression = whereClause;
  }, [tenureFilter.selectedTypes]);

  return null;
};

export default TenureTypeLayer;