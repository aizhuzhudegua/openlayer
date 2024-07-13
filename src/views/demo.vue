<template>
    <div class="canvas-container" ref="screenDom" v-loading.fullscreen.lock="loading"></div>
    <chat :pastedImages="pastedImages"></chat>
</template>

<script setup>


import chat from "../components/chat.vue";
import * as THREE from 'three'
import { ref, onMounted,onBeforeUnmount } from "vue"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import router from '../router';
let screenDom = ref(null)
const loading = ref(true)
const url = ref(null)
const pastedImages = ref([]);

// 在父组件中向ref引用中push数据的方法
function pushToPastedImages(data) {
    pastedImages.value.push(data);
}

class Raster {
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
    lightHelper = [];
    lights = [];
    ambient = new THREE.AmbientLight(0xffffff, 0.3);
    gui = new GUI({ title: "设置" });
    lgui = null;
    background = null;

    constructor() {
        this.init();
    }
    clearGui() {
        this.gui.destroy();
        this.lgui.destroy();

    }
    init() {
        //创建场景
        this.scene = new THREE.Scene()
        //创建相机
        this.camera = new THREE.PerspectiveCamera(
            45,
            screenDom.value.clientWidth / screenDom.value.clientHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 0, 800);

        //创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(screenDom.value.clientWidth, screenDom.value.clientHeight);

        // 开启阴影图
        this.renderer.shadowMap.enabled = true;
        screenDom.value.appendChild(this.renderer.domElement);


        this.scene.add(this.ambient);

        this.initGUI();
        this.addLight();
        // /api/model_glb_min.glb
        this.loadModel(url.value);

        this.createBackground();

        window.addEventListener('resize', () => {
            this.resize();
        });


        this.render();
        this.lightHelper.forEach(element => {
            element.visible = false;
        });


    }


    screenShot() {
        this.renderer.render(this.scene, this.camera);
        // 从画布中读取像素数据
        const dataUrl = this.renderer.domElement.toDataURL('image/png');
        // console.log(dataUrl);
        // 创建一个隐藏的a标签用于下载图像
        // const a = document.createElement('a');
        // a.href = dataUrl;
        // a.download = 'screenshot.png';
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
        pushToPastedImages(dataUrl);
    }
    createBackground() {
        // // 获取屏幕尺寸
        const screenWidth = screenDom.value.clientWidth;
        const screenHeight = screenDom.value.clientHeight;

        // 创建一个平面几何体，尺寸以填满整个屏幕
        const planeGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);


        const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

        // 创建一个平面
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        // 设置平面的位置，使其位于相机的视野内
        const position = new THREE.Vector3(0, 0, -1000);  // 物体的原始位置
        plane.position.z = position.z; // 根据相机位置设置适当的z坐标值

        plane.scale.x = 1.6;
        plane.scale.y = 1.6;
        // 将平面添加到场景中
        this.scene.add(plane);
        this.background = plane;

    }
    initGUI() {
        // 初始化一个颜色变量
        const colorConfig = {
            color: 0xffffff // 初始颜色为白色
        };
        const that = this;

        const lightFolder = this.gui.addFolder("光源设置");

        this.DirectionalLightFolder = lightFolder.addFolder("平行光");

        const ambientFolder = lightFolder.addFolder("环境光");
        ambientFolder.add(this.ambient, "intensity", 0, 10).name("环境光强度");


        ambientFolder.addColor(colorConfig, 'color').onChange(function (color) {
            that.ambient.color.set(color);
        });
        lightFolder.add({
            addlight: () => {
                that.addLight();
            }
        }, 'addlight').name('添加光源');


        this.gui.add({
            line: () => {
                if (that.lightHelper) {
                    that.lightHelper.forEach(element => {
                        element.visible = !element.visible;
                    });
                }

            }
        }, 'line').name('开关辅助线');
        lightFolder.close();


        this.lgui = new GUI({ title: "自定义" });
        this.lgui.domElement.style.left = '0';
        //创建一个包含自定义按钮的控制器
        this.lgui.add({
            share: () => {
                that.screenShot();
            }
        }, 'share').name('截图分享');



    }
    addLight() {
        // 创建光源
        // 初始化一个颜色变量
        const colorConfig = {
            color: 0xffffff // 初始颜色为白色
        };
        let light = new THREE.DirectionalLight(colorConfig, 5);
        light.position.set(0, 100, 400);
        const index = this.lights.length;
        this.scene.add(light);

        const lightHelper = new THREE.DirectionalLightHelper(light);
        this.scene.add(lightHelper);
        this.lightHelper.push(lightHelper);
        lightHelper.visible = false;
        const lhIndex = this.lightHelper.length - 1;
        // 创建一个光源控制器，并添加到GUI实例中
        const lightFolder = this.DirectionalLightFolder.addFolder('Point Light');
        lightFolder.add(light.position, 'x', -500, 500);
        lightFolder.add(light.position, 'y', -500, 500);
        lightFolder.add(light.position, 'z', -500, 500);
        lightFolder.add(light, 'intensity', 0, 10).name('光强度');
        lightFolder.addColor(colorConfig, 'color').onChange(function (color) {
            light.color.set(color);
        });
        let that = this;
        lightFolder.add({
            dellight: () => {
                that.lights.splice(index, 1);
                that.scene.remove(light);
                that.scene.remove(lightHelper);
                that.renderer.render(that.scene, that.camera);
                that.lightHelper.splice(lhIndex, 1);
                lightFolder.destroy();
            }
        }, 'dellight').name('删除光源');
        lightFolder.close();

    }
    loadModel(url) {

        //添加模型
        const loader = new GLTFLoader();
        let that = this;
        loader.load(url, (gltf) => {
            loading.value = false;
            gltf.scene.position.set(0, 0, 0)   // 模型位置
            that.scene.add(gltf.scene)   // 加入场景
            // 获取模型尺寸
            let boundingBox = new THREE.Box3().setFromObject(gltf.scene);
            let size = new THREE.Vector3();
            boundingBox.getSize(size);
            // 计算缩放比例
            let ModelHeight = screenDom.value.clientHeight / 2;
            console.log('ModelHeight:', ModelHeight);
            let maxDimension = Math.max(size.x, size.y, size.z);
            let scale = ModelHeight / maxDimension;  // 设置缩放比例
            // 缩放模型
            gltf.scene.scale.set(scale, scale, scale);

            let controls = {
                positionY: 0 // 初始化 cube 的 y 位置
            };
            that.gui.add(controls, 'positionY', -1000, 1000).onChange(updatePositionY); // 创建一个控制 cube Y 位置的滑块

            function updatePositionY() {
                gltf.scene.position.y = controls.positionY; // 根据滑块值更新 cube 的 y 位置
            }


            let isDragging = false;
            that.renderer.domElement.addEventListener('mousedown', (event) => {
                isDragging = true;
                previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            });

            let previousMousePosition = {
                x: 0,
                y: 0
            };

            // 监听鼠标移动事件
            that.renderer.domElement.addEventListener('mousemove', (event) => {
                if (isDragging) {
                    let deltaX = event.clientX - previousMousePosition.x;
                    let deltaY = event.clientY - previousMousePosition.y;
                    // 根据鼠标移动的距离来旋转模型
                    gltf.scene.rotation.y += deltaX * 0.01;
                    gltf.scene.rotation.x += deltaY * 0.01;
                    // model.rotation.y += deltaX * 0.01;
                    // model.rotation.x += deltaY * 0.01;
                    previousMousePosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                }
            });

            // 监听鼠标滚轮事件
            that.renderer.domElement.addEventListener('wheel', (event) => {
                const delta = event.deltaY * 0.001;  // 根据滚轮事件的deltaY属性计算缩放因子
                gltf.scene.scale.x += delta;  // 根据缩放因子调整模型的缩放
                gltf.scene.scale.y += delta;
                gltf.scene.scale.z += delta;
            });


            // 监听鼠标松开事件
            that.renderer.domElement.addEventListener('mouseup', (event) => {
                isDragging = false;
            });
        },
            // onProgress回调函数
            (xhr) => {
                // 计算加载进度
                const percent = (xhr.loaded / xhr.total) * 100;
                // 更新进度条或显示加载进度
                // console.log(xhr);
                // updateProgressBar(percent);
            },
            // onError回调函数
            (error) => {
                // 资源加载失败的处理
            })
    }
    render() {
        if (this.lightHelper) {
            this.lightHelper.forEach(element => {
                element.update();
            });
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.render());
    }
    resize() {
        this.camera.aspect = screenDom.value.clientWidth / screenDom.value.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(screenDom.value.clientWidth, screenDom.value.clientHeight);
        this.scene.remove(this.background);
        this.createBackground();
    }

}
let raster;


onMounted(() => {
    console.log(router.currentRoute.value.query.url);
    url.value = router.currentRoute.value.query.url;
    raster = new Raster();


})
onBeforeUnmount( ()=>{
    // 在beforeUnmount生命周期钩子中清除和销毁Three.js UI元素
    raster.clearGui();
})

</script>

<style scoped>
.canvas-container {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
}


.lil-gui {
    --background-color: #000;
    --widget-color: #0af;
    --padding: 2px;
}

.example-showcase .el-loading-mask {
    z-index: 999999;
}
</style>