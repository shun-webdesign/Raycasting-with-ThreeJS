import './style/main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import gsap from 'gsap'

window.addEventListener('load', init);

function init() {
    /**
     * Texture Loader
     */
    const textureLoader = new THREE.TextureLoader()

    //Debugger
    // const gui = new dat.GUI()

    /**
     * Canvas
     */
    const canvas = document.querySelector('canvas.webgl')

    // Scene
    const scene = new THREE.Scene()

    const geometry = new THREE.PlaneGeometry(1.5, 1)

    for (let i = 0; i < 6; i++) {
        const material = new THREE.MeshBasicMaterial({
            map: textureLoader.load(`/img/${i}.jpg`)
        })

        const img = new THREE.Mesh(geometry, material)
        img.position.set(Math.random(), i * -1.5)

        scene.add(img)
    }

    //シーン内のオブジェクトを格納する配列の作成
    let objs = []

    //これからシーン内のオブジェクトにアクセスします
    scene.traverse((object) => {
        if (object.isMesh) {
            objs.push(object)
        }
    })


    /**
     * Light
     */
    const pointLight = new THREE.PointLight(0xffffff, 0.1)
    pointLight.position.x = 2
    pointLight.position.y = 3
    pointLight.position.z = 4
    scene.add(pointLight)

    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    window.addEventListener('resize', () => {
        // Save sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    /**
     * Environnements
     */

    // Camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 2
    scene.add(camera)

    // // Test
    // const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshNormalMaterial())
    // scene.add(cube)

    // Renderer

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    /**
     * Mouse
     */
    window.addEventListener("wheel", onMouseWheel)

    let y = 0
    let position = 0

    function onMouseWheel(event) {
        y = event.deltaY * 0.0007
    }


    //Vector2は、レイキャスティングで使用するためにマウスのx値とy値を保存します
    const mouse = new THREE.Vector2()

    //レイキャスティングで使用するためにブラウザからマウスのx、y値を取得するためのものです
    window.addEventListener('mousemove', (event) => {

        mouse.x = event.clientX / sizes.width * 2 - 1

        mouse.y = - (event.clientY / sizes.height) * 2 + 1
    })

    /**
     * Animate
     */
    const raycaster = new THREE.Raycaster()

    const clock = new THREE.Clock()

    const tick = () => {

        const elapsedTime = clock.getElapsedTime()

        // Update objects
        position += y
        y *= .6

        //Raycaster
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(objs)

        //hover
        for (const intersect of intersects) {
            gsap.to(intersect.object.scale, { x: 1.5, y: 1.5 })
            gsap.to(intersect.object.rotation, { y: -0.5 })
            gsap.to(intersect.object.position, { z: -0.9 })
        }

        for (const object of objs) {
            if (!intersects.find(intersect => intersect.object === object)) {
                gsap.to(object.scale, { x: 1, y: 1 })
                gsap.to(object.rotation, { y: 0 })
                gsap.to(object.position, { z: 0 })

            }
        }

        camera.position.y = - position


        // Render
        renderer.render(scene, camera)

        // Keep ticking
        window.requestAnimationFrame(tick)
    }

    tick()
}
