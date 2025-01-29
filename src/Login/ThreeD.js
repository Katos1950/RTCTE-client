import { useEffect } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import SceneInit from './SceneInit';

function ThreeD() {
  useEffect(() => {
    const sceneInit = new SceneInit('myThreeJsCanvas');
    sceneInit.initialize();
    sceneInit.animate();

    // Load the FBX model
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
        '/ball.fbx',
        (fbx) => {
          fbx.scale.set(0.1, 0.1, 0.1);
          fbx.position.set(0, 0, 0);
          sceneInit.scene.add(fbx);
      
          // Store the ball object in SceneInit
          sceneInit.ball = fbx;
      
          // Resize canvas
          const canvas = sceneInit.renderer.domElement;
          const container = canvas.parentElement;
          sceneInit.renderer.setSize(container.clientWidth, container.clientHeight);
          sceneInit.camera.aspect = container.clientWidth / container.clientHeight;
          sceneInit.camera.updateProjectionMatrix();
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('An error occurred while loading the FBX model:', error);
        }
      );
      
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <canvas id="myThreeJsCanvas" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default ThreeD;
