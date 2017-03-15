var THREE =  require('./libs/three');
window.THREE=THREE;
import Config from './Config';
import Stats from './libs/stats.min';

//canvas dom,model params
class Scene {

    constructor(dom) {
        this.container = dom;
        this.option = Config || {};

        this.fov = 45;
        this.update = this._update.bind(this);
        this.isloaded = false;
        this._init();
        this._setControls();
        this._addLight();
    }

    _init() {
        var option = this.option;

        this.canvasWidth = option.width || window.innerWidth;
        this.canvasHeight = option.height || window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(this.fov, this.canvasWidth / this.canvasHeight, .1, 20000);
        
        // scene
        this.scene = new THREE.Scene();
        this.scene.camera=this.camera;
        if(Config.debug) window.scene=this.scene;

        if (this.container.querySelector('canvas')) {
            this.container.removeChild(this.container.querySelector('canvas'))
        }
        this.renderer = new THREE.WebGLRenderer({ alpha: option.alpha || true, antialias: false });

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        //this.renderer.setClearColor(0x061837, 1);
        this.container.appendChild(this.renderer.domElement);

        //this.addGridHelper(5);
        this.stats = new Stats();
        this.container.appendChild( this.stats.dom );

        option.post&&this.post();

    }

    add(object){
        this.scene.add(object)
    }

    remove(object){
        this.scene.remove(object)
    }

    post() {
        require('./libs/EffectComposer/CopyShader.js')
        require('./libs/EffectComposer/EffectComposer.js')
        require('./libs/EffectComposer/ShaderPass.js')
        require('./libs/EffectComposer/RenderPass.js')
        require('./libs/EffectComposer/FXAAShader.js')
        this.composer = new THREE.EffectComposer(this.renderer);

        this.renderPass = new THREE.RenderPass( this.scene, this.camera );
        this.FXAAPass = new THREE.ShaderPass( THREE.FXAAShader );
        this.FXAAPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        this.FXAAPass.renderToScreen = true;

        this.composer.addPass( this.renderPass );
        this.composer.addPass( this.FXAAPass );

    }

    _setControls(){
        switch( Config.controls ){
            case 'orbit' :
            default :
                var OrbitControls=require('./libs/Controls/OrbitControls')(THREE);
                this.controls = new OrbitControls(this.camera, this.renderer.domElement);
                this.controls.rotateSpeed = 0.2;
                break;
            case 'range'  :
                var RangeControls=require('./libs/Controls/RangeControls')(THREE);
                this.controls = new RangeControls(this, { 
                    rx: .2,
                    xMax: Number.POSITIVE_INFINITY,
                    xMin: Number.NEGATIVE_INFINITY,
                    yMax: 9,
                    yMin: 2
                },400);
                break;
        }
    }
    addLightHelpr() {

        var matBox = new THREE.MeshPhongMaterial();
        var geoBox = new THREE.BoxGeometry(5000, 5000, 5000);

        var skyBox = new THREE.Mesh(geoBox, matBox);
        this.scene.add(skyBox);

        lightHelper = new THREE.SpotLightHelper(this.spotLight);
        this.scene.add(lightHelper);
    }
    addGridHelper(step, size) {
        var size = size || 10;

        var gridHelper = new THREE.GridHelper(size, step);
        this.scene.add(gridHelper);
    }
    _addLight() {

    }
    turnOffLight() {

        for(var i=0;i<this.scene.children.length;i++){   
            if(this.scene.children[i] instanceof THREE.Light){
                this.scene.children[i].visible=false;
            }
        }

    }

    resize(w,h) {
        this.renderer.setSize(w, h);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this. camera.updateProjectionMatrix();
        if(this.option.post){
            this.FXAAPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
            this.composer.setSize(window.innerWidth,window.innerHeight)
        }
    }

    _update() {
        requestAnimationFrame(this.update);
        this.render();
    }

    render() {
        //this.camera.position.z+=.7
        this.lightHelper && this.lightHelper.update();
        this.composer ? (this.composer.render()) : this.renderer.render(this.scene, this.camera);
        this.stats.update();
        this.controls.update();
    }

}
export default Scene;