/** @jsxRuntime classic */
/** @jsx React.createElement */
import { Add, Delete, Save, Straighten } from '@mui/icons-material';
import { Box, Button, Divider, Slider, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import SpatialAnalysis from '../../gis/analysis/SpatialAnalysis';
import TerrainModeling from '../../gis/analysis/TerrainModeling';

const SewageDesignTool = ({ parcelId }) => {
  const mountRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState({
    manholes: [],
    pipes: [],
    terrain: null
  });
  const [slopeData, setSlopeData] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    // Initialize 3D scene
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;

    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
    scene.add(transformControls);
    controlsRef.current = transformControls;

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
    scene.add(helper);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    scene.add(gridHelper);

    setScene(scene);

    // Load terrain data
    const loadTerrainData = async () => {
      try {
        const parcel = await SpatialAnalysis.getParcelGeometry(parcelId);
        const bbox = await SpatialAnalysis.calculateBoundingBox(parcel);
        
        // Get enhanced terrain data
        const terrain = await TerrainModeling.getElevationData(bbox);
        const slope = await TerrainModeling.calculateSlope(bbox);
        
        setSlopeData(slope);
        createTerrainMesh(terrain, scene);
        
        setDesign(prev => ({
          ...prev,
          terrain: createTerrainMesh(terrain, scene)
        }));
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load terrain data:', error);
        setLoading(false);
      }
    };

    loadTerrainData();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Event listeners
    const handleClick = (event) => {
      if (activeTool === 'select') {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
          (event.clientX / width) * 2 - 1,
          -(event.clientY / height) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
          const object = intersects[0].object;
          setSelectedObject(object);
          controlsRef.current.attach(object);
        } else {
          setSelectedObject(null);
          controlsRef.current.detach();
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [parcelId, activeTool]);

  const createTerrainMesh = (terrain, scene) => {
    const geometry = new THREE.PlaneGeometry(10, 10, terrain.width - 1, terrain.height - 1);
    
    // Apply elevation data
    for (let i = 0; i < terrain.data.length; i++) {
      const z = terrain.data[i] / 50;
      geometry.attributes.position.setZ(i, z);
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x669966,
      wireframe: false,
      flatShading: true,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    return mesh;
  };

  const addManhole = () => {
    if (!scene) return;
    
    const geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.5,
      roughness: 0.7
    });
    const manhole = new THREE.Mesh(geometry, material);
    manhole.position.set(0, 0.15, 0);
    manhole.castShadow = true;
    manhole.receiveShadow = true;
    manhole.userData.type = 'manhole';
    scene.add(manhole);
    
    setDesign(prev => ({
      ...prev,
      manholes: [...prev.manholes, manhole]
    }));
  };

  const addPipe = () => {
    if (!scene) return;
    
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x666633,
      metalness: 0.3,
      roughness: 0.5
    });
    const pipe = new THREE.Mesh(geometry, material);
    pipe.position.set(0, 0.1, 0);
    pipe.rotation.z = Math.PI / 2;
    pipe.castShadow = true;
    pipe.receiveShadow = true;
    pipe.userData.type = 'pipe';
    scene.add(pipe);
    
    setDesign(prev => ({
      ...prev,
      pipes: [...prev.pipes, pipe]
    }));
  };

  const deleteSelected = () => {
    if (!selectedObject || !scene) return;
    
    scene.remove(selectedObject);
    
    if (selectedObject.userData.type === 'manhole') {
      setDesign(prev => ({
        ...prev,
        manholes: prev.manholes.filter(m => m !== selectedObject)
      }));
    } else if (selectedObject.userData.type === 'pipe') {
      setDesign(prev => ({
        ...prev,
        pipes: prev.pipes.filter(p => p !== selectedObject)
      }));
    }
    
    setSelectedObject(null);
    controlsRef.current.detach();
  };

  const saveDesign = async () => {
    try {
      const designData = {
        manholes: design.manholes.map(m => ({
          position: m.position.toArray(),
          rotation: m.rotation.toArray()
        })),
        pipes: design.pipes.map(p => ({
          position: p.position.toArray(),
          rotation: p.rotation.toArray(),
          length: p.geometry.parameters.height
        })),
        parcelId,
        created: new Date().toISOString()
      };
      
      // In a real app, save to API
      console.log('Design saved:', designData);
    } catch (error) {
      console.error('Failed to save design:', error);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%',
      backgroundColor: '#f5f5f5'
    }}>
      <Box sx={{ 
        width: 250, 
        p: 2,
        borderRight: '1px solid #ddd',
        backgroundColor: 'white'
      }}>
        <Typography variant="h6" gutterBottom>
          Sewage Design Tools
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Terrain Analysis
          </Typography>
          {slopeData && (
            <>
              <Typography variant="body2">
                Avg Slope: {calculateAverage(slopeData.data)}°
              </Typography>
              <Slider
                value={[Math.min(...slopeData.data), Math.max(...slopeData.data)]}
                min={0}
                max={45}
                valueLabelDisplay="auto"
                disabled
                sx={{ mt: 2 }}
              />
            </>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Design Elements
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={addManhole}
            fullWidth
            sx={{ mb: 1 }}
          >
            Add Manhole
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Straighten />}
            onClick={addPipe}
            fullWidth
            sx={{ mb: 1 }}
          >
            Add Pipe
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Delete />}
            onClick={deleteSelected}
            fullWidth
            disabled={!selectedObject}
            color="error"
          >
            Delete Selected
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Button 
          variant="contained" 
          startIcon={<Save />}
          onClick={saveDesign}
          fullWidth
          color="success"
        >
          Save Design
        </Button>
      </Box>
      
      <Box sx={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.7)',
            zIndex: 10
          }}>
            <Typography>Loading terrain data...</Typography>
          </Box>
        ) : null}
        
        <Box 
          ref={mountRef} 
          sx={{ 
            height: '100%',
            backgroundColor: '#e0e0e0'
          }}
        />
      </Box>
    </Box>
  );
};

const calculateAverage = (arr) => {
  const sum = arr.reduce((a, b) => a + b, 0);
  return (sum / arr.length).toFixed(1);
};

export default SewageDesignTool;