let isAlreadyCalling = false;
let getCalled = false;
const existingCalls = [];
const {
    RTCPeerConnection,
    RTCSessionDescription
} = window;
const peerConnection = new RTCPeerConnection();

function unselectUsersFromList() {
    const alreadySelectedUser = document.querySelectorAll(
        ".active-user.active-user--selected"
    );

    alreadySelectedUser.forEach(el => {
        el.setAttribute("class", "active-user");
    });
}

function createUserItemContainer(socketId) {
    const userContainerEl = document.createElement("div");

    const usernameEl = document.createElement("p");

    userContainerEl.setAttribute("class", "active-user");
    userContainerEl.setAttribute("id", socketId);
    usernameEl.setAttribute("class", "username");
    usernameEl.innerHTML = `Socket: ${socketId}`;

    userContainerEl.appendChild(usernameEl);

    userContainerEl.addEventListener("click", () => {
        unselectUsersFromList();
        userContainerEl.setAttribute("class", "active-user active-user--selected");
        const talkingWithInfo = document.getElementById("talking-with-info");
        talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
        callUser(socketId);
    });

    return userContainerEl;
}

async function callUser(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-user", {
        offer,
        to: socketId
    });
}

function updateUserList(socketIds) {
    const activeUserContainer = document.getElementById("active-user-container");

    socketIds.forEach(socketId => {
        const alreadyExistingUser = document.getElementById(socketId);
        if (!alreadyExistingUser) {
            const userContainerEl = createUserItemContainer(socketId);

            activeUserContainer.appendChild(userContainerEl);
        }
    });
}

const socket = io(location.origin, {
    path: '/socket/'
});

socket.on("update-user-list", ({
    users
}) => {
    updateUserList(users);
});

socket.on("remove-user", ({
    socketId
}) => {
    const elToRemove = document.getElementById(socketId);

    if (elToRemove) {
        elToRemove.remove();
    }
});

socket.on("call-made", async data => {
    if (getCalled) {
        const confirmed = confirm(
            `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
        );

        if (!confirmed) {
            socket.emit("reject-call", {
                from: data.socket
            });

            return;
        }
    }

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("make-answer", {
        answer,
        to: data.socket
    });
    getCalled = true;
});

socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

    if (!isAlreadyCalling) {
        callUser(data.socket);
        isAlreadyCalling = true;
    }
});

socket.on("call-rejected", data => {
    alert(`User: "Socket: ${data.socket}" rejected your call.`);
    unselectUsersFromList();
});

peerConnection.ontrack = function ({
    streams: [stream]
}) {
    const remoteVideo = document.getElementById("remote-video");
    if (remoteVideo) {
        remoteVideo.srcObject = stream;
    }
};

navigator.getUserMedia({
        video: true,
        audio: true
    },
    stream => {
        const localVideo = document.getElementById("local-video");
        if (localVideo) {
            localVideo.srcObject = stream;
        }

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    },
    error => {
        console.warn(error.message);
    }
);

const canvas = document.getElementById("canvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3.Black;

    const alpha = -10;
    const beta = Math.PI / 2;
    const radius = 10;
    const target = new BABYLON.Vector3(0, 5, 0);
    const camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, target, scene);
    camera.lowerRadiusLimit = 0;
    camera.upperRadiusLimit = 10;
    // camera.lowerRadiusLimit = camera.upperRadiusLimit = camera.radius;
    camera.attachControl();
    scene.activeCamera = camera;

    // const skyMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
    // skyMaterial.backFaceCulling = false;
    // const skybox = Mesh.CreateBox("skyBox", 1000.0, scene);
    // skybox.material = skyMaterial;

    const hemiLight1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 50, 0), scene);
    hemiLight1.intensity = 0.8;

    const hemiLight2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -50, 0), scene);
    hemiLight2.intensity = 0.8;

    BABYLON.SceneLoader.ImportMesh("", "/assets/meshes/", "class_akather.glb", scene, function (newMeshes) {
        // camera.target = newMeshes[0];
    });

    BABYLON.SceneLoader.ImportMesh("", "/assets/meshes/", "char_akather.glb", scene, function (newMeshes) {
        // camera.target = newMeshes[0];
    });

    // var materialPlane = new BABYLON.StandardMaterial("texturePlane", scene);
    // materialPlane.diffuseTexture = new BABYLON.Texture("/assets/img/avatar.jpg", scene);
    // materialPlane.specularColor = new BABYLON.Color3(0, 0, 0);
    // // materialPlane.backFaceCulling = false; //Allways show the front and the back of an element

    // //Creation of a plane
    // var plane = BABYLON.Mesh.CreatePlane("plane", 120, scene);
    // plane.rotation.x = 0;
    // plane.material = materialPlane;

    // const myMap = SceneLoader.Append("./assets/meshes/", "map_akather.glb", scene);
    // const myModel = SceneLoader.Append("./assets/meshes/", "char_akather.glb", scene);

    // const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    // const xrPromise = scene.createDefaultXRExperienceAsync({
    // 	floorMeshes: [ground]
    // });

    // const box = MeshBuilder.CreateBox("box", {});
    // box.position.x = 0.5;
    // box.position.y = 1;

    // const boxMaterial = new StandardMaterial("material", scene);
    // boxMaterial.diffuseColor = Color3.Random();
    // box.material = boxMaterial;

    // box.actionManager = new ActionManager(scene);
    // box.actionManager.registerAction(
    // 	new ExecuteCodeAction(ActionManager.OnPickTrigger,
    // 		function (evt) {
    // 			// const sourceBox = evt.meshUnderPointer;
    // 			// sourceBox.position.x += 0.1;
    // 			// sourceBox.position.y += 0.1;

    // 			boxMaterial.diffuseColor = Color3.Random();
    // 		}));

    // const ball = MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
    // ball.position = new Vector3(0, 1, 0);

    // scene.onKeyboardObservable.add(e => {
    // 	switch (e.event.type) {
    // 		case 'keyup':
    // 			switch (e.event.key) {
    // 				case ' ':
    // 					// var forwardDirection = scene.activeCamera.getForwardRay(3).direction;
    // 					console.log('moving forward', scene.activeCamera);
    // 					// camera.position.addInPlace(forwardDirection);
    // 					break;
    // 			}
    // 			break;
    // 	}

    // });

    return scene;
};

const sceneToRender = createScene();
engine.runRenderLoop(function () {
    sceneToRender.render();
});