const socket = io(location.origin, {
	path: '/socket/'
});


socket.on('close', (event) => {
	console.log('close');
	// alert('Vui lòng tải lại trang.');
	// location.reload();
});

socket.on('error', (event) => {
	console.log('error');
	// alert('Vui lòng tải lại trang.');
	// location.reload();
});

socket.on('broadcast', (msg) => {
	console.log(msg);
});

const canvas = document.getElementById("canvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(this.engine);
    const alpha = 1;
    const beta = Math.PI / 3;
    const radius = 20;
    const target = new BABYLON.Vector3(0, 5, 0);
    const camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, target, scene);
    camera.lowerRadiusLimit = 0;
    camera.upperRadiusLimit = 20;
    camera.attachControl();

    const skyMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
    skyMaterial.backFaceCulling = false;
    const skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
    skybox.material = skyMaterial;

    const hemiLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 50, 0), scene);
    hemiLight.intensity = 2;
    BABYLON.SceneLoader.ImportMesh("", "/assets/meshes/", "map_akather.glb", scene, function (newMeshes) {
        // camera.target = newMeshes[0];
    });

    return scene;
};

const sceneToRender = createScene();
engine.runRenderLoop(function () {
    sceneToRender.render();
});