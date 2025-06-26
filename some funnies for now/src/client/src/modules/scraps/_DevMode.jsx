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

const Panel = () => {
    return (
        <div
            onMouseDown={(e) => !isTopPanelLocked && startResize(e, 'top')}
            style={{
                position: 'absolute',
                top: topHeight - 5,
                left: leftWidth,
                width: `calc(100% - ${leftWidth + rightWidth}px)`,
                height: 10,
                cursor: 'ns-resize',
                zIndex: 10,
            }}
        >
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
        </div>
    )
}

const panel = {
    position: null,
    resize: null,
    style: {
        top: null,
        left: null,
        width: null,
        minWidth: null,
        maxWidth: null,
        height: null,
        minHeight: null,
        maxHeight: null,
        cursor: null,
        zIndex: null
    },
    children: null
}

const { assign } = Object

let panels = [
    {},
    {},
    {},
    {}
]

panels = panels.map(_ => assign(_, panel))

const Panels = () => {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: `${topHeight}px 1fr ${bottomHeight}px`,
                gridTemplateColumns: `${leftWidth}px 1fr ${rightWidth}px`,
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
            <div style={{ gridArea: 'left', background: '#222', color: 'white' }}>Left Panel</div>
            <div style={{ gridArea: 'right', background: '#222', color: 'white' }}>Right Panel</div>
            <div style={{ gridArea: 'top', background: '#444', color: 'white', opacity: opacity / 100, }}>Top Panel</div>
            <div style={{ gridArea: 'bottom', background: '#444', color: 'white' }}>Bottom Panel</div>
            <canvas
                ref={canvasRef}
                style={{
                    gridArea: 'center',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'lightgray',
                }}
            />
            {panels.map(panel => Panel(panel))}
        </div>
    );
}

const CodeEditor = () => {
    //  const [code, setCode] = useState(`import { chunk } from "lodash";\n\nconst parts = chunk([1,2,3,4], 2);`);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [code, setCode] = useState(null)
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
        </Box>
    );
}

export default DevMode = ({ state, handler }) => (
    <div style={{ display: 'contents' }}>
        {Panels()}
        {CodeEditor()}
    </div>
)