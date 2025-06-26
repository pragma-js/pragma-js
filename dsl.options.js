export default options = {
    paths: {
        src: input,
        out: null
    },
    pragmas: {
        web: {
            html: true,
            css: true,
            frameworks: {
                react: true
            },
        },
    },
    setttings: {
        parser: {
            extractIndentation: true,
            spacesPerIndent: 2
        }
    },
    flags: {
        READ: 0b0000,
        WRITE: 0b0000,
        EXECUTE: 0b0000,
        ADMIN: 0b0000,
    }
};