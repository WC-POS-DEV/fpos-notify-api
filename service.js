const path = require("path")
const service = require("node-windows").Service

const svc = new service({
    name: "FPOS Notification System",
    description: "Web server for controlling the FPOS Notification and Ingredient Label add-on system.",
    script: __dirname + path.sep + 'server.js',
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
})

svc.on("install", () => {
    svc.start();
})

let args = process.argv.slice(2)
if (args.length && args[0].toLowerCase() === '-uninstall') {
    svc.uninstall()
} else {
    svc.install()
}