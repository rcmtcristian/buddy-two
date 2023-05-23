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

// import { HTMLLayout } from '../../components/html-layout'
// const inter = Inter({ subsets: ['latin'] })

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
    controls.enabled = true

    const axesHelper = new THREE.AxesHelper(1)
    axesHelper.visible = true
    scene.add(axesHelper)

    const gridHelper = new THREE.GridHelper(10, 10)
    gridHelper.visible = true
    scene.add(gridHelper)

    const dirLightColorHelper = new THREE.DirectionalLightHelper(dirLightColor, 0.5)
    dirLightColorHelper.visible = true
    scene.add(dirLightColorHelper)

    const dirLightWhiteHelper = new THREE.DirectionalLightHelper(dirLightWhite, 0.5)
    dirLightWhiteHelper.visible = true
    scene.add(dirLightWhiteHelper)

    /* TRACK CURSOR */
    const cursorTracker = trackCursor()

    /* TRACK WHEEL */
    let wheelDelta = 0
    let wheelScrollTarget = 0
    let wheelScroll = 0

    const onWheel = (e: WheelEvent) => {
      wheelDelta = e.deltaY * 0.002
      wheelScrollTarget += wheelDelta
      snapGroupTargetRotation += wheelDelta
    }

    window.addEventListener('wheel', onWheel)

    /* RENDER LOOP */
    let frameId: number
    let screenTexture: THREE.Texture
    let monitor: THREE.Object3D
    let snapGroup: THREE.Group
    let snapGroupTargetRotation = 0

    monitor = new THREE.Mesh(
      new THREE.OctahedronGeometry(1, 0),
      new THREE.MeshStandardMaterial({
        color: 'red',
      }),
    )

    scene.add(monitor)
    const render = () => {
      controls.update()

      /* new stuff */
      if (monitor) {
        const lerpAmount = 0.1
        const rangeOfMovementRad = Math.PI / 4
        // Makes it so that the rotation is based at a lower speed on rotation
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

        // monitor.rotation.y = THREE.MathUtils.lerp(monitor.rotation.y, snapGroupTargetRotation, 0.1) <- this version makes it so that it rotates on zoom
        // monitor.rotation.y = (cursorTracker.cursor.x * Math.PI) / 4 <- this is the original
      }
      /* end of  stuff */
      renderer.render(scene, camera)

      stats?.update()
      frameId = requestAnimationFrame(render)
    }

    /* LOAD MODEL */
    const gltfLoader = new GLTFLoader()
    gltfLoader.setMeshoptDecoder(MeshoptDecoder)

    gltfLoader
      .loadAsync('/models/Monitor-Looper.glb')
      /* MODEL SETUP */
      .then((gltf) => {
        //GLTF is loaded
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

Home.Title = 'Twitch Demo No. 2'
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
