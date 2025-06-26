const uWS = require("uWebSockets.js");
const BABYLON = require("@babylonjs/core");
const msgpack = require("@msgpack/msgpack");

const { NullEngine, Scene, FreeCamera, Vector3, HemisphericLight, Frustum, MeshBuilder } = BABYLON;
const PORT = 1090;

const engine = new NullEngine();
const scene = new Scene(engine);
const clients = new Map();

// Create a sample player camera
const globalCamera = new FreeCamera("globalCamera", new Vector3(0, 20, 0), scene);
globalCamera.setTarget(Vector3.Zero());
//  camera.maxZ = 20;   // Max Render Distance
//  Create sample meshes
const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
light.intensity = 0.85;

/*
const ground = MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, scene);

const near = MeshBuilder.CreateBox('inFrustum', { size: 2 }, scene);
near.position = new Vector3(0, -10, 0); // In front of camera

const far = MeshBuilder.CreateBox('outFrustum', { size: 2 }, scene);
far.position = new Vector3(100, 1, 0); // Far away

const meshes = [ground, near, far];
*/

const meshes = [];

function getVisibleMeshes(camera) {
    const transformMatrix = camera.getTransformationMatrix();
    const frustumPlanes = Frustum.GetPlanes(transformMatrix);
    const camPos = camera.position;

    return meshes.filter(mesh => {
        const dist = Vector3.Distance(camPos, mesh.position);
        //  if (dist > MAX_DISTANCE) return false;
        return mesh.isInFrustum(frustumPlanes);
    });
}

function serializeMeshes(meshList) {
    return meshList.map(mesh => ({
        id: mesh.name,
        type: mesh.metadata?.type || "box",
        position: {
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z
        },
        rotation: {
            x: mesh.rotation.x,
            y: mesh.rotation.y,
            z: mesh.rotation.z
        },
        scaling: {
            x: mesh.scaling.x,
            y: mesh.scaling.y,
            z: mesh.scaling.z
        }
    }));
}

function computeDeltas(oldList, newList) {
    const oldMap = new Map(oldList.map(obj => [obj.id, obj]));
    return newList.filter(obj => {
        const prev = oldMap.get(obj.id);
        return !prev || JSON.stringify(prev) !== JSON.stringify(obj);
    });
}

uWS.App({
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 60
}).ws("/*", {
    open: (ws) => {
        const camera = new FreeCamera(`camera-${Date.now()}`, new Vector3(0, 5, -15), scene);
        camera.setTarget(Vector3.Zero());
        clients.set(ws, { camera, previous: [] });
    },

    message: (ws, message, isBinary) => {
        const client = clients.get(ws);
        if (!client) return;

        try {
            if (isBinary) {
                const data = msgpack.decode(new Uint8Array(message));
                if (data.position) {
                    client.camera.position = new Vector3(data.position.x, data.position.y, data.position.z);
                }
                if (data.forward) {
                    const forward = new Vector3(data.forward.x, data.forward.y, data.forward.z);
                    const target = client.camera.position.add(forward);
                    client.camera.setTarget(target);
                }
            } else {
                const text = Buffer.from(message).toString();
                const data = JSON.parse(text);
                //  console.log('[Input]', data.event);
            }
        } catch (err) {
            console.warn("[Server] Failed to parse message:", err);
        }
    },
    close: (ws) => {
        clients.delete(ws);
    }
}).listen(PORT, (token) => {
    if (token) console.log(`✅ WebSocket server running on port ${PORT}`);
});

let lastUpdate = 0;
const UPDATE_INTERVAL = 1000 / 20;

//  Comment Spammed Logs

//  Test Visible Meshs
//  Test Delta Updates

//  Backup
//  Organize
//  Backup

engine.runRenderLoop(() => {
    const now = Date.now();
    if (now - lastUpdate >= UPDATE_INTERVAL) {
        for (const [ws, client] of clients) {
            const visible = serializeMeshes(getVisibleMeshes(client.camera));
            const delta = computeDeltas(client.previous, visible);
            client.previous = visible;

            if (delta.length > 0) {
                const encoded = msgpack.encode(delta);
                ws.send(encoded, true);
            } else {
                ws.send(msgpack.encode([]), true);
            }
        }
        lastUpdate = now;
    }

    scene.render(); // Safe even in NullEngine
});

