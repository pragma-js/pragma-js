import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import Editor from '@monaco-editor/react';

/*
const lodashTypes = `
declare module "lodash" {
  export function chunk<T>(array: T[], size?: number): T[][];
  export function debounce<T extends (...args: any[]) => any>(func: T, wait?: number): T;
  // Add more as needed...
}
`;
*/

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
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 14,
          }}
        />
      </Paper>
    </Box>
  );
};

export default CodeEditor;
