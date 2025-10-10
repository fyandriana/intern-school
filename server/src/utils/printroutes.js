// src/utils/printRoutes.js
export function printRoutes(app) {
    const out = [];
    app._router?.stack?.forEach((m) => {
        if (m.route) {
            const methods = Object.keys(m.route.methods).map(x=>x.toUpperCase()).join(",");
            out.push(`${methods}  ${m.route.path}`);
        } else if (m.name === "router" && m.handle?.stack) {
            const base = m.regexp?.source
                ?.replace(/^\\\^\\\//, "/")
                ?.replace(/\\\/\?\(\?=\\\/\|\$\)\$?/, "")
                ?.replace(/\\\//g, "/") || "";
            m.handle.stack.forEach((h) => {
                if (h.route) {
                    const methods = Object.keys(h.route.methods).map(x=>x.toUpperCase()).join(",");
                    out.push(`${methods}  ${base}${h.route.path}`);
                }
            });
        }
    });
    console.log("\n=== Registered Routes ===");
    out.sort().forEach((r) => console.log(r));
    console.log("=========================\n");
}
