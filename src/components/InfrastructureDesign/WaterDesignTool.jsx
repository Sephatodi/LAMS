/** @jsxRuntime classic */
/** @jsx React.createElement */

import { Delete, Save, Straighten, Waves } from '@mui/icons-material';
import { Box, Button, Divider, Slider, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { Water } from 'three/examples/jsm/objects/Water';
import SpatialAnalysis from '../../gis/analysis/SpatialAnalysis';
import TerrainModeling from '../../gis/analysis/TerrainModeling';

const WaterDesignTool = ({ parcelId }) => {
  const mountRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState({
    pipes: [],
    tanks: [],
    sources: [],
    terrain: null
  });
  const [terrainData, setTerrainData] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Enhanced scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0f7fa);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    // Water simulation
    const waterGeometry = new THREE.PlaneGeometry(20, 20);
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x0077be,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.1;
    scene.add(water);

    setScene(scene);

    // Load terrain data
    const loadTerrainData = async () => {
      try {
        const parcel = await SpatialAnalysis.getParcelGeometry(parcelId);
        const bbox = await SpatialAnalysis.calculateBoundingBox(parcel);
        
        // Get enhanced terrain data
        const terrain = await TerrainModeling.getElevationData(bbox);
        const slope = await TerrainModeling.calculateSlope(bbox);
        
        setTerrainData({
          elevation: terrain,
          slope
        });
        
        const terrainMesh = createTerrainMesh(terrain, scene);
        setDesign(prev => ({
          ...prev,
          terrain: terrainMesh
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
      water.material.uniforms.time.value += 0.05;
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Event listeners
    const handleClick = (event) => {
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
    };

    renderer.domElement.addEventListener('click', handleClick);

    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [parcelId]);

  const createTerrainMesh = (terrain, scene) => {
    const geometry = new THREE.PlaneGeometry(10, 10, terrain.width - 1, terrain.height - 1);
    
    // Apply elevation data
    for (let i = 0; i < terrain.data.length; i++) {
      const z = terrain.data[i] / 100;
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

  const addWaterPipe = () => {
    if (!scene) return;
    
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x0066cc,
      metalness: 0.3,
      roughness: 0.4
    });
    const pipe = new THREE.Mesh(geometry, material);
    pipe.position.set(0, 0.05, 0);
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

  const addWaterTank = () => {
    if (!scene) return;
    
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x99ccff,
      metalness: 0.7,
      roughness: 0.2
    });
    const tank = new THREE.Mesh(geometry, material);
    tank.position.set(0, 0.5, 0);
    tank.castShadow = true;
    tank.receiveShadow = true;
    tank.userData.type = 'tank';
    scene.add(tank);
    
    setDesign(prev => ({
      ...prev,
      tanks: [...prev.tanks, tank]
    }));
  };

  const deleteSelected = () => {
    if (!selectedObject || !scene) return;
    
    scene.remove(selectedObject);
    
    if (selectedObject.userData.type === 'pipe') {
      setDesign(prev => ({
        ...prev,
        pipes: prev.pipes.filter(p => p !== selectedObject)
      }));
    } else if (selectedObject.userData.type === 'tank') {
      setDesign(prev => ({
        ...prev,
        tanks: prev.tanks.filter(t => t !== selectedObject)
      }));
    }
    
    setSelectedObject(null);
    controlsRef.current.detach();
  };

  const saveDesign = async () => {
    try {
      const designData = {
        pipes: design.pipes.map(p => ({
          position: p.position.toArray(),
          rotation: p.rotation.toArray(),
          length: p.geometry.parameters.height
        })),
        tanks: design.tanks.map(t => ({
          position: t.position.toArray(),
          rotation: t.rotation.toArray(),
          diameter: t.geometry.parameters.radiusTop * 2,
          height: t.geometry.parameters.height
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
      backgroundColor: '#e3f2fd'
    }}>
      <Box sx={{ 
        width: 250, 
        p: 2,
        borderRight: '1px solid #ddd',
        backgroundColor: 'white'
      }}>
        <Typography variant="h6" gutterBottom>
          Water System Design
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Terrain Analysis
          </Typography>
          {terrainData && (
            <>
              <Typography variant="body2">
                Min Elev: {Math.min(...terrainData.elevation.data)}m
              </Typography>
              <Typography variant="body2">
                Max Elev: {Math.max(...terrainData.elevation.data)}m
              </Typography>
              <Slider
                value={[0, Math.max(...terrainData.elevation.data)]}
                min={0}
                max={100}
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
            startIcon={<Straighten />}
            onClick={addWaterPipe}
            fullWidth
            sx={{ mb: 1 }}
          >
            Add Pipe
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Waves />}
            onClick={addWaterTank}
            fullWidth
            sx={{ mb: 1 }}
          >
            Add Water Tank
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
            backgroundColor: '#bbdefb'
          }}
        />
      </Box>
    </Box>
  );
};

export default WaterDesignTool;