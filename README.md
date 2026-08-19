# FLASH 10 Memory Cat

An interactive event memory wall. Guests decorate a blank cat on a phone at `/create`; the cat is saved locally and immediately appears, animated, on the fullscreen `/wall`.

## Architecture

- `client/`: React, Vite, React Router, react-konva and GSAP.
- `server/`: Express, Socket.IO, and local filesystem persistence.
- `server/uploads/`: submitted transparent PNG files.
- `server/data/submissions.json`: submission metadata only.

## Prerequisites

- Node.js 20 or newer (Node 24 was used during implementation).
- A phone and laptop on the same Wi-Fi network for LAN testing.

## Install and run

From the repository root:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the creator on the laptop at `http://localhost:5173/create` and the wall at `http://localhost:5173/wall`. The API and Socket.IO server listen on port `3001`.

For separate processes:

```powershell
npm.cmd run dev:server
npm.cmd run dev:client
```

Build and type-check before a handoff:

```powershell
npm.cmd run check
npm.cmd run build
```

## LAN testing

1. Start both apps on the laptop with `npm.cmd run dev`.
2. Find the laptop's Wi-Fi IPv4 address:

   ```powershell
   ipconfig
   ```

   Use the `IPv4 Address` under the active Wi-Fi adapter. For example, if it is `192.168.1.25`, open `http://192.168.1.25:5173/create` on the phone.
3. Keep `http://localhost:5173/wall` open on the laptop or projector.
4. Decorate a cat, select Float or Hop, and press **BRING ME TO LIFE**. The wall should update without a refresh.

Vite and Express bind to `0.0.0.0`; no IP address is hardcoded. If Windows Firewall asks, allow Node.js on private networks so the phone can reach ports 5173 and 3001.

## Using the demo

At `/create`, optionally enter a name, draw with brush or eraser, choose a size and color, drag short text or word stickers, select an animation, and submit. Drawing is clipped to the cat silhouette. The exported PNG has a transparent exterior and is stored separately from its animation metadata.

At `/wall`, saved cats restore after refresh. New cats arrive through Socket.IO, pop in, and then Float or Hop according to their submission.

## Current limitations

- This is a LAN development prototype with local disk storage, not a production deployment.
- There is no moderation, authentication, database, image upload, or paper-scanning flow.
- Clear removes the current decoration but does not remove already submitted memories.

## Screenshots / GIFs

Add event screenshots or a short end-to-end GIF here after the first physical-device test.
