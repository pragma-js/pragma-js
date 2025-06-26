import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

// CapitalCase helper (for React component naming)
function isPascalCase(name) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

// Detect class
function isClass(func) {
  return typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func));
}

// Detect likely React component
function isLikelyComponent(name, val) {
  return (
    typeof val === 'function' &&
    isPascalCase(name) &&
    (val.prototype?.isReactComponent || // class component
      val.propTypes ||                  // defined prop types
      val.defaultProps ||               // default props
      val.displayName)                  // React display name
  );
}

const dependencies = {
  ...projectPkg.dependencies,
  // ...projectPkg.devDependencies,
};

const typeMap = {};

for (const pkgName of Object.keys(dependencies)) {
  const result = {
    components: [],
    classes: [],
    functions: [],
    others: [],
  };

  try {
    const mod = await import(pkgName);

    for (const [name, val] of Object.entries(mod)) {
      if (isLikelyComponent(name, val)) {
        result.components.push(name);
      } else if (isClass(val)) {
        result.classes.push(name);
      } else if (typeof val === 'function') {
        result.functions.push(name);
      } else {
        result.others.push(name);
      }
    }
  } catch (err) {
    result.error = err.message;
  }

  typeMap[pkgName] = result;
}

// Output
console.log(JSON.stringify(typeMap, null, 2));

// Optional: write to file
// fs.writeFileSync('typed-import-map.json', JSON.stringify(typeMap, null, 2));
