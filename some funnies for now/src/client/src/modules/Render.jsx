const A = _ => Array.isArray(_)
const F = (f, p) => f(p)
const E = ({ T, a, k, v = false, c }) => v ? <T {...a} key={k} /> : T ? <T {...a} key={k}>{c || `${c}`}</T > : <div key={k}>{c || `${c}`}</div>

const D = (_, _k) => {
    if (!A(_)) _ = [_]
    return (
        <div key={_k}>
            {_.length && _.map((e, k) => {
                const { t, a, v } = e

                // which priority (?)

                // check array literal
                // direct [] or nested []

                // check json literal
                // direct json or nested json

                if ('e' in e) {
                    if (!(e.e)) {
                        return;
                    };
                };

                let c;
                if ('c' in e) {
                    c = e.c;
                    if (A(c) && c.length) {
                        c = c.map((_, _k) => D(_, _k));
                    }
                } else {
                    c = '';
                };
                /*
                const T = t;
                console.log(typeof T, T)
                */
                let p = { T: t, a, k, v: v && v, c }
                return E(p)
            })}
        </div>
    )
}

const Render = _ => F(D, _);


export default Render;