// @ts-nocheck
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import soldier from './assets/Soldier.glb';

const App = () => {
  console.log(soldier);
  React.useEffect(() => {
    let scene,  
      renderer,
      camera,
      model,                              // Our character
      head,
      neck,                               // Reference to the neck bone in the skeleton
      waist,                               // Reference to the waist bone in the skeleton
      back,
      lowerback,
      hips,
      leftUpLeg,
      leftLeg,
      leftFoot,
      rightUpLeg,
      rightLeg,
      rightFoot,
      leftArm,
      leftForeArm,
      rightArm,
      rightForeArm,
      mixer,                              // THREE.js animations mixer
      clock = new THREE.Clock(),          // Used for anims, which run to a clock instead of frame rate 
      loaderAnim = document.getElementById('js-loader');

    const MODEL_PATH = soldier;

    const init = () => {
      const canvas = document.getElementById('c');
      const backgroundColor = 0xf1f1f1;

      // Configure scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);

      // Add axis lines coz im stupid
      const axesHelper = new THREE.AxesHelper( 100 );
      scene.add( axesHelper );

      // Init the renderer
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      document.body.appendChild(renderer.domElement);

      // Add a camera
      camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 1000 );
      camera.position.set(0, 1, 3);

      // Orbit controls to drag scene
      const controls = new OrbitControls( camera, renderer.domElement );
      controls.target = new THREE.Vector3(0, 1, 0);
      controls.update();

      // Add Model
      const loader = new GLTFLoader();
      loader.load(
        MODEL_PATH,
        function(gltf) {
          model = gltf.scene;
          console.log(model);
          model.rotateOnAxis(new THREE.Vector3(0, 1, 0), 3.14);

          // Bone references
          neck = model.getObjectByName( 'mixamorigNeck' );
          back = model.getObjectByName( 'mixamorigSpine2' );
          lowerback = model.getObjectByName( 'mixamorigSpine1' );
          waist = model.getObjectByName( 'mixamorigSpine' );
          leftArm = model.getObjectByName( 'mixamorigLeftArm' );
          leftForeArm = model.getObjectByName( 'mixamorigLeftForeArm' );
          rightArm = model.getObjectByName( 'mixamorigRightArm' );
          rightForeArm = model.getObjectByName( 'mixamorigRightForeArm' );
          leftUpLeg = model.getObjectByName( 'mixamorigLeftUpLeg' );
          leftLeg = model.getObjectByName( 'mixamorigLeftLeg' );
          rightUpLeg = model.getObjectByName( 'mixamorigRightUpLeg' );
          rightLeg = model.getObjectByName( 'mixamorigRightLeg' );

          model.traverse(o => {
            if (o.isBone) {
              console.log(o.name);
            }
          });
        
          const helper = new THREE.SkeletonHelper(model);
          scene.add(helper);
          scene.add(model);
          loaderAnim.remove();

          // mixer = new AnimationMixer(model);
          // const idleAnim = AnimationClip.findByName(fileAnimations, 'swingdance');
          // idleAnim.tracks.splice(0, 3);
          // idleAnim.tracks.splice(0, 3);
          // idleAnim.tracks.splice(6, 3);
          // idle = mixer.clipAction(idleAnim);
          // idle.play();
        },
        undefined,
        function(error) {
          console.error(error);
        }
      );

      // Add lights
      const hemilight = new THREE.HemisphereLight();
      const dirLight = new THREE.DirectionalLight();
      dirLight.position.set(0, 0, 10);
      scene.add(hemilight);
      scene.add(dirLight);

      // Floor
      // let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
      // let floorMaterial = new THREE.MeshPhongMaterial({
      //   color: 0xeeeeee,
      //   shininess: 0,
      // });

      // let floor = new THREE.Mesh(floorGeometry, floorMaterial);
      // floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
      // floor.receiveShadow = true;
      // floor.position.y = -11;
      // scene.add(floor);

      // Add floormat
      // let geometry = new THREE.SphereGeometry(2, 32, 32);
      // let material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); // 0xf2ce2e 
      // let sphere = new THREE.Mesh(geometry, material);
      // sphere.position.z = -5;
      // sphere.position.y = 1;
      // scene.add(sphere);
    }

    const update = () => {
      if (mixer) {
        mixer.update(clock.getDelta());
      }

      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);
      requestAnimationFrame(update);
    }

    const resizeRendererToDisplaySize = (renderer) => {
      const canvas = renderer.domElement;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const canvasPixelWidth = canvas.width / window.devicePixelRatio;
      const canvasPixelHeight = canvas.height / window.devicePixelRatio;
    
      const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

    const getMousePos = (e) => {
      return { x: e.clientX, y: e.clientY };
    }

    const moveJoint = (mouse, joint, degreeLimit) => {
      const degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
      joint.rotation.y = THREE.Math.degToRad(degrees.x);
      joint.rotation.x = THREE.Math.degToRad(degrees.y);
    }

    const getMouseDegrees = (x, y, degreeLimit) => {
      let dx = 0,
          dy = 0,
          xdiff,
          xPercentage,
          ydiff,
          yPercentage;
    
      const w = { x: window.innerWidth, y: window.innerHeight };
    
      // Left (Rotates neck left between 0 and -degreeLimit)
      
       // 1. If cursor is in the left half of screen
      if (x <= w.x / 2) {
        // 2. Get the difference between middle of screen and cursor position
        xdiff = w.x / 2 - x;  
        // 3. Find the percentage of that difference (percentage toward edge of screen)
        xPercentage = (xdiff / (w.x / 2)) * 100;
        // 4. Convert that to a percentage of the maximum rotation we allow for the neck
        dx = ((degreeLimit * xPercentage) / 100) * -1; }
    // Right (Rotates neck right between 0 and degreeLimit)
      if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
      }
      // Up (Rotates neck up between 0 and -degreeLimit)
      if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        // Note that I cut degreeLimit in half when she looks up
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
        }
      
      // Down (Rotates neck down between 0 and degreeLimit)
      if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
      }
      return { x: dx, y: dy };
    }

    document.addEventListener('mousemove', function(e) {
      const mousecoords = getMousePos(e);
      if (neck && waist && lowerback && back) {
        moveJoint(mousecoords, neck, 30);
        moveJoint(mousecoords, back, 30);
        moveJoint(mousecoords, lowerback, 30);
        moveJoint(mousecoords, waist, 30);
      }
    });

    document.addEventListener('keypress', (e) => {
      if (e.code === 'KeyW') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, 0.707107);
        leftUpLeg.applyQuaternion(quaternion);
      } else if (e.code === 'KeyS') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, -0.707107);
        leftUpLeg.applyQuaternion(quaternion);
      } else if (e.code === 'KeyA') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, 0.707107);
        leftLeg.applyQuaternion(quaternion);
      } else if (e.code === 'KeyD') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, -0.707107);
        leftLeg.applyQuaternion(quaternion);
      } else if (e.code === 'KeyT') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, 0.707107);
        rightUpLeg.applyQuaternion(quaternion);
      } else if (e.code === 'KeyG') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, -0.707107);
        rightUpLeg.applyQuaternion(quaternion);
      } else if (e.code === 'KeyF') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, 0.707107);
        rightLeg.applyQuaternion(quaternion);
      } else if (e.code === 'KeyH') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, -0.707107);
        rightLeg.applyQuaternion(quaternion);
      } else if (e.code === 'KeyJ') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, 0.707107);
        leftArm.applyQuaternion(quaternion);
      } else if (e.code === 'KeyL') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, 0.707107);
        rightArm.applyQuaternion(quaternion);
      } else if (e.code === 'KeyU') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, 0.707107);
        leftForeArm.applyQuaternion(quaternion);
      } else if (e.code === 'KeyO') {
        const quaternion = new THREE.Quaternion(0.707107, 0, 0, 0.707107);
        rightForeArm.applyQuaternion(quaternion);
      } else if (e.code === 'KeyI') {
        const quaternion = new THREE.Quaternion(0, 0, 0.707107, 0.707107);
        leftArm.applyQuaternion(quaternion);
      } else if (e.code === 'KeyK') {
        const quaternion = new THREE.Quaternion(0, 0, 0.707107, 0.707107);
        rightArm.applyQuaternion(quaternion);
      }
    })

    init();
    update();

  }, []);

  return (
    <>
      <div className="loading" id="js-loader"><div className="loader"></div></div>
      <div className="wrapper">
        <canvas id="c"></canvas>
      </div>
    </>
  )
}

function render() {
  ReactDOM.render(<App />, document.getElementById('react-app'));
}

render();