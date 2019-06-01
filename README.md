# web_helper

## Development Workflow

1. Open two terminals at the project's root directory
1. In the first terminal(`t1`) run this command: `npm run watch`
1. In the second terminal(`t2`) run this command: `npm run dev`

At this point, `t1` should be watching all the source code and rebundling everything into the `dist/` directory.

`t2` should be watching `dist/` for changes and live-reload both the main process and the renderer process automatically.

## IPC Communication

For IPC I chose to use EipHop. It is a nice, convenient, little rigging for a fetch-like requests made from the renderer to the main process.

You can see an example of its use [here](https://medium.com/@shivekkhurana/introducing-eiphop-an-electron-ipc-wrapper-good-fit-for-react-apps-50de6826a47e).

I have set up a few actions that can be called already in the `api/` directory.

Anything set up in there and added to the `api/index.ts` file properly should automatically be exposed for use in the renderer process.

You can see examples of how the renderer can use the actions in the `SandboxView` and the `LoginView` components.
