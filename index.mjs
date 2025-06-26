import FlagManager from './modules/FlagManager.mjs';

const user = new FlagManager(0)
    .enable(['READ', 'WRITE', 'ADMIN']);

console.log(user.has('READ'));             // true
console.log(user.has(['READ', 'WRITE']));  // true
console.log(user.has(['READ', 'EXECUTE'])); // false

console.log(user.run());     // "Can ADMIN"
console.log(user.runAll());  // [ "Can ADMIN", "Can WRITE", "Can READ" ]

console.log(user.toJSON());

