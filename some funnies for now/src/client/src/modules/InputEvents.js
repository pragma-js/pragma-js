const mouseEvents = [
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'mouseover',
    'mouseout',
    'contextmenu', // right-click
];

const keyboardEvents = [
    'keydown',
    'keyup',
    'keypress', // deprecated but still useful in some scenarios
];

const touchEvents = [
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
];

const pointerEvents = [
    'pointerdown',
    'pointerup',
    'pointermove',
    'pointerenter',
    'pointerleave',
    'pointerover',
    'pointerout',
    'pointercancel',
];

const formEvents = [
    'input',
    'change',
    'focus',
    'blur',
    'submit',
    'reset',
];

const wheelEvents = [
    'wheel',
    'scroll',
];

const inputEvents = [
    ...mouseEvents,
    ...keyboardEvents,
    ...touchEvents,
    ...pointerEvents,
    ...formEvents,
    ...wheelEvents,
];

export default inputEvents;