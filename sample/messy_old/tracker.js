const React = require('react');

function createHeapBoundElementTracker() {
    let rootType = null;
    let currentProps = {};
    let children = [];

    function rebuild() {
        if (!rootType) {
            root = null;
            return;
        }
        const propsCopy = { ...currentProps };
        if (children.length === 1) propsCopy.children = children[0];
        else if (children.length > 1) propsCopy.children = children;
        else delete propsCopy.children;

        if (propsCopy.style && Object.keys(propsCopy.style).length === 0) delete propsCopy.style;
        root = React.createElement(rootType, propsCopy);
    }

    let root = null;

    const proxy = new Proxy({}, {
        get(_, prop) {
            if (prop === 'root') return () => root;
            if (prop === 'json') return () => ({ type: rootType, props: currentProps, children });
            if (prop === 'children' || prop === 'c') return children;
            if (prop === 'type') return rootType;

            if (prop in currentProps) return currentProps[prop];
            if (currentProps.style && prop in currentProps.style) return currentProps.style[prop];
            if (prop in proxy) return proxy[prop];

            return undefined;
        },

        set(_, prop, value) {
            if (prop === 'type') {
                rootType = value;
                rebuild();
                return true;
            }
            if (prop === 'children' || prop === 'c') {
                children = Array.isArray(value) ? value : [value];
                rebuild();
                return true;
            }
            if (typeof prop === 'string' && /^[a-z][A-Za-z0-9]*$/.test(prop) && (typeof value === 'string' || typeof value === 'number')) {
                if (!currentProps.style) currentProps.style = {};
                currentProps.style[prop] = value;
                rebuild();
                return true;
            }

            currentProps[prop] = value;
            rebuild();
            return true;
        },

        has(_, prop) {
            return prop === 'type' || prop === 'root' || prop === 'json' || prop in currentProps || (currentProps.style && prop in currentProps.style);
        },

        ownKeys() {
            return ['type', 'root', 'json', ...Object.keys(currentProps), ...(currentProps.style ? Object.keys(currentProps.style) : [])];
        },

        getOwnPropertyDescriptor(_, prop) {
            if (prop === 'type' || prop === 'root' || prop === 'json') {
                return { enumerable: true, configurable: true, value: proxy[prop] };
            }
            if (prop in currentProps) {
                return { enumerable: true, configurable: true, value: currentProps[prop] };
            }
            if (currentProps.style && prop in currentProps.style) {
                return { enumerable: true, configurable: true, value: currentProps.style[prop] };
            }
            return undefined;
        }
    });

    return proxy;
}

module.exports = { createHeapBoundElementTracker };