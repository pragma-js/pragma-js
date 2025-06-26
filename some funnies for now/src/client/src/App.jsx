import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import msgpack from 'msgpack-lite';

import { Slider, Box, Paper, Typography } from '@mui/material';
import Editor from '@monaco-editor/react';

import { Tree } from "@minoru/react-dnd-treeview";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaFolder, FaFile, FaChevronRight, FaChevronDown } from "react-icons/fa";

import { Resizable } from 're-resizable';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import inputEvents from './modules/inputEvents';

//  import DevMode from './modules/DevMode';

import './App.css';

import { merge, cloneDeep } from 'lodash';

const createMappedSetter = (target, mappings, basePath = []) => {
  return new Proxy({}, {
    get(_, key) {
      return (value) => {
        const fullPath = [...basePath, ...(mappings[key] || [key])];
        let ref = target;
        for (let i = 0; i < fullPath.length - 1; i++) {
          if (!ref[fullPath[i]] || typeof ref[fullPath[i]] !== 'object') {
            ref[fullPath[i]] = {};
          }
          ref = ref[fullPath[i]];
        }
        ref[fullPath.at(-1)] = value;
      };
    }
  });
};

const htmlPropMappings = {
  position: ['top', 'right', 'bottom', 'left'],
  size: ['width', 'height'],
  spacing: ['margin', 'padding'],
  text: ['color', 'fontSize', 'fontWeight', 'textAlign', 'lineHeight'],
  display: ['display', 'visibility'],
  flex: ['flex', 'flexDirection', 'alignItems', 'justifyContent', 'gap'],
  grid: ['gridTemplateColumns', 'gridTemplateRows', 'gap'],
  background: ['backgroundColor', 'backgroundImage', 'backgroundSize'],
  border: ['border', 'borderColor', 'borderWidth', 'borderRadius'],
  shadow: ['boxShadow'],
  transform: ['transform', 'scale', 'rotate', 'translate'],
  opacity: ['opacity'],
  transition: ['transition', 'transitionDuration', 'transitionTimingFunction'],
  pointer: ['cursor', 'pointerEvents'],
  overflow: ['overflow', 'overflowX', 'overflowY'],
  zIndex: ['zIndex'],
  visibility: ['visibility'],
  animation: ['animation', 'animationDuration', 'animationDelay'],
  layout: ['position', 'top', 'right', 'bottom', 'left', 'zIndex'],
  alignment: ['verticalAlign', 'textAlign']
};

//  const set = createMappedSetter(state, mappings, ['width', 'height']);

//  console.log(set);

//  const state = {};

/*
const { assign } = Object

const { Engine, Scene, FreeCamera, Vector3, HemisphericLight, MeshBuilder } = BABYLON;

const mock_data_TreeView = [
  { id: 1, parent: 0, droppable: true, text: "src" },
  { id: 2, parent: 1, droppable: true, text: "components" },
  { id: 3, parent: 2, droppable: false, text: "Header.jsx" },
  { id: 4, parent: 2, droppable: false, text: "Footer.jsx" },
  { id: 5, parent: 1, droppable: true, text: "utils" },
  { id: 6, parent: 5, droppable: false, text: "helpers.js" },
  { id: 7, parent: 0, droppable: false, text: "package.json" },
  { id: 8, parent: 0, droppable: false, text: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApackage.json" }
]
*/
/*
treeData: initialData,
selectedId: null,
isDevMode: true,
tabValue: '1',
*/
/*
const createPanelProxy = target => new Proxy({}, {
  get: (_, side) => width => {
    if (!target[side]) {
      target[side] = {};
    }
    target[side] = Object.assign(target[side], { size: { width } });
  }
});

// Example usage:
const panel = {
  opacity: {
    value: 100,
    isEnable: false
  },
  resize: {
    isEnable: false,
  },
  size: {
    height: null,
    width: null
  }
};
const proxy = createPanelProxy(panel);

proxy.left(220);
proxy.right(260);
proxy.top(150);
proxy.bottom(180);

const initialState = {
  isDevMode: true,
  panel
};
*/

/*
export default function App() {
  const [state, setState] = useState(initialState);

  //  const { isDevMode, panels } = state;
  const socketRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef({
    engine: null,
    scene: null,
    camera: null,
    meshes: new Map()
  });
  //  const isDragging = useRef({ direction: '', startX: 0, startY: 0 })   // PASS TO DEVMODE COMPONENT
  //  const socketRef = useRef(null);

  const updateState = (update) => {
    const _new = merge(state, update)
    setState(_new)
  }

  const { getWebSocket, readyState } = useWebSocket('ws://localhost:1090', {
    share: true,
    retryOnError: true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    onOpen: () => {
      console.log('[WS] Connected');
      const ws = getWebSocket();
      if (ws) {
        ws.binaryType = 'arraybuffer'; // Set binaryType to arraybuffer
        socketRef.current = ws; // Save WebSocket instance to ref
      }
    },
    onClose: () => console.log('[WS] Disconnected'),
    onError: () => console.log('[WS] Error')
  }, true);

  useEffect(() => {
    // Setup scene
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    const camera = new FreeCamera('clientCamera', new Vector3(0, 20, -30), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvasRef.current, true);
    new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    gameRef.current = { engine, scene, camera, meshes: new Map() };
    //  console.log(true)

    engine.runRenderLoop(() => {
      const { camera } = gameRef.current;

      if (readyState === ReadyState.OPEN) {
        sendMessage(msgpack.encode({
          type: 'camera',
          position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          forward: camera.getForwardRay().direction
        }));
      }

      scene.render();
    });

    window.addEventListener('resize', () => engine.resize());

    return () => {
      engine.dispose();
      scene.dispose();
    };
  }, []);

  useEffect(() => {
    const initLayout = () => {
      const totalWidth = window.innerWidth;
      const totalHeight = window.innerHeight;
      const { left, right } = state.panel;
      const contentWidth = totalWidth - left.size.width - right.size.width;
      const contentHeight = (contentWidth / 16) * 9;
      let verticalSpace = totalHeight - contentHeight;
      let top = Math.floor(verticalSpace / 2);
      let bottom = totalHeight - contentHeight - top;
      updateState({
        panels: {
          top: {
            size: {
              height: verticalSpace,
              width: top
            }
          },
          bottom: {
            size: {
              height: verticalSpace,
              width: bottom
            }
          }
        }
      });
      console.log(state.panel)
    };


    initLayout();
    window.addEventListener('resize', initLayout);
    return () => window.removeEventListener('resize', initLayout);
  }, []);

  const Panels = () => {  //
    const { top, bottom, left, right } = state.panel
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateRows: `${top.size.height}px 1fr ${bottom.size.height}px`,
          gridTemplateColumns: `${left.size.width}px 1fr ${right.size.width}px`,
          gridTemplateAreas: `
              "left top right"
              "left center right"
              "left bottom right"
              `,
          height: '100vh',
          width: '100vw',
          userSelect: 'none',
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            gridArea: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'lightgray',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {state.isDevMode && <Panels />}
      {/*state.isDevMode && <CodeEditor />*/  //}
//  </div >
//  )
//}

// END COMPONENT

//  <canvas ref={canvasRef} style={{ width: '100%', height: '100vh', display: 'block', backgroundColor: 'lightgray', position: 'absolute' }} />


/*
let _panels = [
{
position: 'top',
parent: {
props: {
style: {
top: 0,
left: left.size.width,
right: right.size.width,
bottom: 'auto',
width: null,  // 100% - left width + right width
//  minWidth: null,
//  maxWidth: null,
height: null, // Set, Apply
//  minHeight: null,
//  maxHeight: null
}
}
},
Child: _ => {
return (
<>
</>
)
}
},
{
position: 'bottom',
parent: {
props: {
style: {
top: 'auto',
left: left.size.width,
right: right.size.width,
bottom: 0,
width: null,  // 100% - left width + right width
//  minWidth: null,
//  maxWidth: null,
height: null, // Set, Apply
//  minHeight: null,
//  maxHeight: null,
}
}
},
Child: _ => {
return <></>
}
},
{
position: 'right',
parent: {
props: {
style: {
top: 0,
left: 'auto',
right: 0,
bottom: 'auto',
width: right.size.width,
//  minWidth: null,
//  maxWidth: null,
height: '100%',
//  minHeight: null,
//  maxHeight: null,
}
}
},
Child: _ => {
return <></>
}
},
{
position: 'left',
parent: {
props: {
style: {
top: 0,
left: 0,
right: 'auto',
bottom: 'auto',
width: left.size.width,
//  minWidth: null,
//  maxWidth: null,
height: '100%',
//  minHeight: null,
//  maxHeight: null,
},
}
},
Child: _ => {
return <></>
}
}
]
*/

/*
  <input type='button' value='toggleResize' onClick={() => setIsTopPanelLock(!isTopPanelLock)} />
  <input type='button' value='toggleOpacity' onClick={() => setIsOpacityEnable(!isOpacityEnable)} />
  <input type='button' value='resetPanelSize' onClick={() => setTopHeight(initialTopHeight)} />
  <Slider
    value={opacity}
    onChange={handleOpacity}
    min={0}
    max={100}
    step={1}
    valueLabelDisplay="auto"
    aria-label="Opacity Slider"
  />
*/

/*

useEffect(() => {
  // Input relay (optional)
  const handler = (e) => {
    sendMessage(JSON.stringify({ event: e.type }));
  };
  inputEvents.forEach(event => window.addEventListener(event, handler));
  return () => inputEvents.forEach(event => window.removeEventListener(event, handler));
}, []);
*/


/*
const startResize = (e, direction) => {
  e.preventDefault();
  isDragging.current = { direction, startX: e.clientX, startY: e.clientY };
  document.addEventListener('mousemove', resizePanel);
  document.addEventListener('mouseup', stopResize);
};

const resizePanel = (e) => {
  const { direction, startX, startY } = isDragging.current;

  if (direction === 'left') {
    const delta = e.clientX - startX;
    setLeftWidth((prev) => Math.max(100, prev + delta));
    isDragging.current.startX = e.clientX;
  } else if (direction === 'right') {
    const delta = startX - e.clientX;
    setRightWidth((prev) => Math.max(100, prev + delta));
    isDragging.current.startX = e.clientX;
  } else if (direction === 'top') {
    const delta = e.clientY - startY;
    setTopHeight((prev) => Math.max(100, prev + delta));
    isDragging.current.startY = e.clientY;
  } else if (direction === 'bottom') {
    const delta = startY - e.clientY;
    setBottomHeight((prev) => Math.max(100, prev + delta));
    isDragging.current.startY = e.clientY;
  }
};

const stopResize = () => {
  document.removeEventListener('mousemove', resizePanel);
  document.removeEventListener('mouseup', stopResize);
};

const panel = {
  parent: {
    props: {
      //resize: position => state.panels[`${position}`].resize.isEnable && startResize(e, position),
      style: {
        position: 'absolute',
        cursor: 'ns-resize',
        zIndex: 10,
        backgroundColor: '#222',
        color: 'white'
      }
    }
  }
} //  Fix to Proper Assign

_panels = _panels.map(_ => merge(_, panel))
*/
/*<Child />*/
/*
const Panel = ({ _, index }) => {
  const { position, parent, Child } = _
  const _parent = { ...parent.props, ...{ style: { gridArea: position } } }
  return (
    <div key={index} {..._parent}>
      { }
    </div >
  )
}

const Panels = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: `${top.size.height}px 1fr ${bottom.size.height}px`,
        gridTemplateColumns: `${left.size.width}px 1fr ${right.size.width}px`,
        gridTemplateAreas: `
          "left top right"
          "left center right"
          "left bottom right"
        `,
        height: '100vh',
        width: '100vw',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          gridArea: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: 'lightgray',
        }}
      />
    </div>
  );
}

console.log(true)

return (
  <div style={{
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden'
  }}>
    {isDevMode && <Panels />}
    {/*isDevMode && <CodeEditor />*///}
//</div >
//);
//}

//  {_panels.map((panel, index) => Panel({ _: panel, index: index }))}


/*
const handleEditorWillMount = (monaco) => {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    module: monaco.languages.typescript.ModuleKind.ESNext,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowJs: true,
    noEmit: true,
  });

  monaco.languages.typescript.javascriptDefaults.addExtraLib(lodashTypes, 'file:///node_modules/@types/lodash/index.d.ts');
};
  <Typography variant="h6" gutterBottom>
    Monaco Editor with Lodash IntelliSense
  </Typography>
*/

/*
return (
  <Box sx={{ p: 2 }} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: isEditorOpen ? 'auto' : 'none' }}>
    <Paper elevation={3} sx={{ height: '500px' }}>
      <Editor
        height="100%"
        language="javascript"
        value={code}
        theme="vs-dark"
        //  beforeMount={handleEditorWillMount}
        onChange={(val) => setCode(val)}
        options={{
          tabSize: 2,
          minimap: { enabled: true },
          wordWrap: 'on',
          fontSize: 14,
        }}
      />
    </Paper>
  </Box >
);
}
*/

//  const CodeEditor = () => {
//  const [code, setCode] = useState(`import { chunk } from "lodash";\n\nconst parts = chunk([1,2,3,4], 2);`);
//  const [isEditorOpen, setIsEditorOpen] = useState(false);
//  const [code, setCode] = useState(null)






















/*
useEffect(() => {
  // Handle incoming mesh data
  if (!lastMessage || !(lastMessage.data instanceof ArrayBuffer)) return;

  const byteLength = lastMessage.data.byteLength;
  //  console.log('[WS] Message received, byteLength:', byteLength);

  if (byteLength === 0) return; // 🛑 Prevent decode error on empty data

  try {
    const decoded = msgpack.decode(new Uint8Array(lastMessage.data));
    //  console.log('[WS] Decoded:', decoded);

    const { meshes } = gameRef.current;
    decoded.forEach(update => {
      let mesh = meshes.get(update.id);
      if (!mesh) {
        mesh = MeshBuilder.CreateBox(update.id, { size: 1 }, gameRef.current.scene);
        meshes.set(update.id, mesh);
      }

      mesh.position.set(update.position.x, update.position.y, update.position.z);
      mesh.rotation.set(update.rotation.x, update.rotation.y, update.rotation.z);
      mesh.scaling.set(update.scaling.x, update.scaling.y, update.scaling.z);
    });
  } catch (e) {
    console.error('[WS] Decode failed:', e);
  }
}, [lastMessage]);
*/