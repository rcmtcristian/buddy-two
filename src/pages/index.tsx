import { Inter } from '@next/font/google'
import keyBy from 'lodash/keyBy'
// import Head from 'next/head'
// import Image from 'next/image'
// import { getApp } from 'firebase/app'
import * as THREE from 'three'
// import styles from '../styles/Home.module.css'
import { useRef, useEffect } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// @ts-ignore
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { isDev } from '../lib/constants'
import { trackCursor } from '../lib/three'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.style.setProperty('overscroll-behavior', 'none')
    document.documentElement.style.setProperty('overflow', 'hidden')

    return () => {
      document.documentElement.style.removeProperty('overscroll-behavior')
      document.documentElement.style.removeProperty('overflow')
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const progress = progressRef.current

    if (!canvas || !progress) return

    /* RENDERER SETUP */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      // @ts-ignore
      outputColorSpace: THREE.SRGBColorSpace,
      toneMapping: THREE.LinearToneMapping,
    })
    const { width: canvasWidth, height: canvasHeight } = canvas.getBoundingClientRect()
    renderer.setSize(canvasWidth, canvasHeight, false)
    renderer.setPixelRatio(window.devicePixelRatio)

    /* STATS */
    let stats: Stats

    if (isDev) {
      stats = new Stats()
      document.body.appendChild(stats.dom)
    }

    /* CAMERA SETUP */
    const fov = 20
    const aspect = canvasWidth / canvasHeight
    const near = 0.1
    const far = 100
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.z = 15

    /* SCENE SETUP */
    const scene = new THREE.Scene()

    // > Lights config
    const baseLightIntensity = 0.15
    const lightIntensityRange = 0.4

    const dirLightColor = new THREE.DirectionalLight('#ec5a29', baseLightIntensity)
    dirLightColor.position.set(-3, -2.5, 3)
    scene.add(dirLightColor)

    const dirLightWhite = new THREE.DirectionalLight('#fff', baseLightIntensity)
    dirLightWhite.position.set(3, 2.5, 3)
    scene.add(dirLightWhite)

    /* HELPERS */
    const controls = new OrbitControls(camera, canvas)
    controls.target.set(0, 0, 0)
    controls.enabled = false

    const axesHelper = new THREE.AxesHelper(1)
    axesHelper.visible = false
    scene.add(axesHelper)

    const gridHelper = new THREE.GridHelper(10, 10)
    gridHelper.visible = false
    scene.add(gridHelper)

    const dirLightColorHelper = new THREE.DirectionalLightHelper(dirLightColor, 0.5)
    dirLightColorHelper.visible = false
    scene.add(dirLightColorHelper)

    const dirLightWhiteHelper = new THREE.DirectionalLightHelper(dirLightWhite, 0.5)
    dirLightWhiteHelper.visible = false
    scene.add(dirLightWhiteHelper)

    /* TRACK CURSOR */
    const cursorTracker = trackCursor()

    /* TRACK WHEEL */
    let wheelDelta = 0
    let wheelScrollTarget = 0
    let wheelScroll = 0

    const onWheel = (e: WheelEvent) => {
      wheelDelta = e.deltaY * 0.002
      /* The above code is written in CoffeeScript, not TypeScript. It is rotating the `snapGroup`
      object around the y-axis by the value of `wheelDelta`. */
      // snapGroup.rotation.y += wheelDelta
      wheelScrollTarget += wheelDelta

      /* This line is incrementing the value of the variable `snapGroupTargetRotation` by the value
    of `wheelDelta`. The `+=` operator is shorthand for adding the value on the right-hand side to
    the current value of the variable on the left-hand side and assigning the result back to the
    variable. */
      snapGroupTargetRotation += wheelDelta
    }

    window.addEventListener('wheel', onWheel)

    /* RENDER LOOP */
    let frameId: number
    let screenTexture: THREE.Texture
    let monitor: THREE.Object3D
    let snapGroup: THREE.Group
    let snapGroupTargetRotation = 0

    // monitor = new THREE.Mesh(
    //   new THREE.OctahedronGeometry(1, 0),
    //   new THREE.MeshStandardMaterial({
    //     color: 'red',
    //   }),
    // )

    // scene.add(monitor)
    const render = () => {
      controls.update()

      /* New stuff */
      if (monitor) {
        const lerpAmount = 0.1
        /* `const rangeOfMovementRad = Math.PI / 4` is setting the range of movement for the monitor
        model in radians. It is used in the `render` function to calculate the rotation of the
        monitor based on the cursor position. By setting the range of movement to `Math.PI / 4`, the
        monitor can rotate up to 45 degrees in any direction based on the cursor position. */
        //animate the monitor to follow the cursor <- basically
        const rangeOfMovementRad = Math.PI / 4
        // Makes it so that the rotation is based at a lower speed on rotation <- basically
        /* This line of code is using the `THREE.MathUtils.lerp` function to smoothly interpolate the
       current rotation of the `monitor` object around the y-axis towards a target rotation based on
       the x-coordinate of the cursor position. The `cursorTracker.cursor.x * rangeOfMovementRad`
       expression calculates the target rotation in radians based on the x-coordinate of the cursor
       position and a range of movement specified by `rangeOfMovementRad`. The `lerpAmount`
       parameter determines the amount of interpolation to apply, with a value of 0.1 indicating a
       relatively slow interpolation. By using interpolation, the rotation of the `monitor` object
       is smoothly updated in response to changes in the cursor position, creating a more fluid and
       natural interaction. */
        monitor.rotation.y = THREE.MathUtils.lerp(
          monitor.rotation.y,
          cursorTracker.cursor.x * rangeOfMovementRad,
          lerpAmount,
        )

        monitor.rotation.x = THREE.MathUtils.lerp(
          monitor.rotation.x,
          -cursorTracker.cursor.y * rangeOfMovementRad,
          lerpAmount,
        )

        wheelScroll = THREE.MathUtils.lerp(wheelScroll, wheelScrollTarget, lerpAmount)
        const deltaScroll = wheelScroll - wheelScrollTarget

        // monitor.rotation.y = THREE.MathUtils.lerp(monitor.rotation.y, snapGroupTargetRotation, 0.1) <- this version makes it so that it rotates on zoom
        // monitor.rotation.y = (cursorTracker.cursor.x * Math.PI) / 4 <- this is the original

        const snapPoint = 0
        const snapPointAttractionForce = 0.2 // How much the snap point attracts the rotation
        const distanceToSnapPointShortestDelta =
          ((snapGroup.rotation.y - snapPoint + Math.PI) % (Math.PI * 2)) - Math.PI

        // > Normalized in terms of PI radians, -1 is -180 degrees away, 1 is 180 degrees away
        const normalizedDistanceToSnapPoint = distanceToSnapPointShortestDelta / Math.PI

        // > How much the snap point attracts the monitor rotation with the current rotation value
        const resultantSnapForce = -normalizedDistanceToSnapPoint * snapPointAttractionForce

        // > Apply snap force to target rotation // To know how many rotations the monitor has done <- basically
        snapGroupTargetRotation += resultantSnapForce

        /* Animate screen texture */
        /* The code is calculating the number of full rotations (in terms of radians) that have
        been applied to an object represented by the `snapGroup` variable. It does this by dividing
        the current rotation of the object around the y-axis (`snapGroup.rotation.y`) by the total
        angle of a full rotation (2π radians), and storing the result in the `rounds` variable. */
        const rounds = snapGroup.rotation.y / (Math.PI * 2)
        screenTexture.offset.y = rounds / 2 // Divided by two bc the txt is half angy half neutral

        /* Lerp snap rotation to target */
        snapGroup.rotation.y = THREE.MathUtils.lerp(
          snapGroup.rotation.y,
          snapGroupTargetRotation,
          lerpAmount,
        )

        progress.style.width = `${THREE.MathUtils.clamp(
          Math.abs(deltaScroll * 0.1) * 100,
          0,
          100,
        ).toFixed(2)}%`
      }
      /* end of  stuff */
      renderer.render(scene, camera)

      stats?.update()
      frameId = requestAnimationFrame(render)
    }

    /* LOAD MODEL */
    const gltfLoader = new GLTFLoader()
    /* `gltfLoader.setMeshoptDecoder(MeshoptDecoder)` is setting the MeshoptDecoder as the decoder to be
   used by the GLTFLoader. MeshoptDecoder is a library that provides fast and efficient decoding of
   compressed mesh data, which can significantly reduce the size of 3D models and improve loading
   times. By setting the MeshoptDecoder as the decoder for the GLTFLoader, the loader is able to
   efficiently decode compressed mesh data in GLTF files, resulting in faster loading times for 3D
   models. */
    gltfLoader.setMeshoptDecoder(MeshoptDecoder)

    gltfLoader
      .loadAsync('/models/Monitor-Looper.glb')
      /* MODEL SETUP */
      .then((gltf) => {
        //GLTF is loaded
        /* `const nodes = keyBy(gltf.scene.children, 'name')` is creating an object where each child of
      the loaded GLTF model is a property of the object, with the property name being the name of
      the child. This is done using the `keyBy` function from the Lodash library. This object can
      then be used to easily access specific children of the model by their name, as demonstrated in
      the code with `monitor = nodes['Monitor']`. */
        const nodes = keyBy(gltf.scene.children, 'name')

        /* `monitor = nodes['Monitor']` is assigning the child object with the name 'Monitor' from the
        loaded GLTF model to the `monitor` variable. This allows for easy access to the specific
        child object for further manipulation, such as scaling or rotating. */
        monitor = nodes['Monitor']
        /* `monitor.scale.set(1.2, 1.2, 1.2)` is setting the scale of the `monitor` object to 1.2 times
       its original size in all three dimensions (x, y, and z). This makes the monitor model larger
       and more visible in the scene. */
        monitor.scale.set(1.2, 1.2, 1.2)

        /* This line of code is setting the side of the material of the first child of the `monitor`
       object to `THREE.FrontSide`. This determines which side of the geometry will be rendered.
       `THREE.FrontSide` means that only the front faces of the geometry will be rendered, while
       `THREE.BackSide` would render only the back faces, and `THREE.DoubleSide` would render both.
       The `as any` syntax is used to bypass TypeScript's type checking and allow access to the
       `material` property without a type error. */
        ;(monitor.children[0] as any).material.side = THREE.FrontSide

        /* `screenTexture = (monitor.children[1] as any).material.map` is assigning the texture map of
        the second child of the `monitor` object to the `screenTexture` variable. The `as any`
        syntax is used to bypass TypeScript's type checking and allow access to the `material` and
        `map` properties without a type error. This texture map can be used to manipulate the
        appearance of the screen on the monitor model. */
        screenTexture = (monitor.children[1] as any).material.map
        // screenTexture.wrapS = THREE.RepeatWrapping
        // screenTexture.wrapT = THREE.MirroredRepeatWrapping <- flip the face
        snapGroup = new THREE.Group()
        snapGroup.add(monitor)

        scene.add(snapGroup)
      })
      /* START LOOP */
      .then(() => {
        frameId = requestAnimationFrame(render)
      })

    const resizeHandler = () => {
      const { width, height } = canvas.getBoundingClientRect()

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height, false)
      renderer.setPixelRatio(window.devicePixelRatio)
    }

    window.addEventListener('resize', resizeHandler, { passive: true })

    return () => {
      stats?.dom?.remove()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', resizeHandler)
      cancelAnimationFrame(frameId)
      renderer.dispose()
      cursorTracker.destroy()
    }
  }, [])

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '5vh',
          background: 'black',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 400,
            height: 48,
            marginTop: 12,
            borderRadius: '9999px',
            overflow: 'hidden',
            border: '1px solid #ec5a29',
          }}
        >
          <div
            ref={progressRef}
            style={{
              background: 'white',
              height: '100%',
              width: 0,
              borderRadius: '9999px',
            }}
          />
          <p
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 'max-content',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Basement Grotesque Display',
              mixBlendMode: 'difference',
            }}
          >
            Wheel force
          </p>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />
    </>
  )
}

Home.Title = 'Buddy Monitor'
Home.Description = (
  <>
    <p>Key points to learn with this demo:</p>
    <ul>
      <li>
        Structure and setup of a basic Three.js scene: <code>Renderer</code> <code>Scene</code>{' '}
        <code>Camera</code> <code>Mesh (model)</code> <code>Lights</code>
      </li>
      <li>
        Basic setup for the animation <code>(RAF)</code>
      </li>
      <li>
        Binding basic DOM events for simple interactions <code>Mouse Movement</code> and{' '}
        <code>Scroll</code>
      </li>
    </ul>
  </>
)
