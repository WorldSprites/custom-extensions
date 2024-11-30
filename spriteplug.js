let socket = null;
let currentServer = null;
let connected = false;
let lastData = null;
function handleMessage(data) {
  lastData = data;
}
function resetClient() {
  socket = null;
  currentServer = null;
  connected = false;
}

async function newClient(url) {
  if (!(await Scratch.canFetch(url))) {
    console.warn("Did not get permission to connect, aborting...");
    return;
  }

  // Establish a connection to the server
  console.log("Connecting to server:", url);
  try {
    socket = new WebSocket(url);
  } catch (e) {
    console.warn("An exception has occurred:", e);
    return;
  }

  // Bind connection established event
  socket.onopen = function (event) {
    currentServer = url;
    connected = true;
    // Set the link state to connected.
    console.log("Connected");

    // Return promise (during setup)
    return;
  };

  // Bind message handler event
  socket.onmessage = function (event) {
    handleMessage(event.data);
  };

  // Bind connection closed event
  socket.onclose = function (event) {
    // Reset clVars values
    resetClient();
    // Return promise (during setup)
    return;
  };
}
class spriteplug {
  getInfo() {
    return {
      id: "spriteplug",
      name: "SpritePlug",
      blocks: [
        {
          opcode: "openSocket",
          blockType: Scratch.BlockType.COMMAND,
          text: "Connect to [IP]",
          arguments: {
            IP: { type: Scratch.ArgumentType.STRING },
          },
        },
        {
          opcode: "connectedState",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "Connected?",
        },
        {
          opcode: "disconnect",
          blockType: Scratch.BlockType.COMMAND,
          text: "Disconnect",
        },
        "---",
        {
          opcode: "setUsername",
          blockType: Scratch.BlockType.COMMAND,
          text: "Set username [data]",
          arguments: {
            data: { type: Scratch.ArgumentType.STRING },
          },
        },
        "---",
        {
          opcode: "lastestData",
          blockType: Scratch.BlockType.REPORTER,
          text: "Last received data",
        },
      ],
    };
  }
  lastestData() {
    return lastData;
  }
  openSocket(args) {
    if (socket != null) {
      console.warn("Already connected to a server.");
      return;
    }
    return newClient(args.IP);
  }
  connectedState() {
    return connected;
  }
  disconnect() {
    if (socket == null) {
      console.warn("Not connected");
      return;
    }
    console.log("Disconnecting");
    socket.close(1000, "Client going away");
    resetClient();
  }
  sendPacket(args) {
    socket.send(
      JSON.stringify({
        command: {
          type: "packet",
        },
        targets: true,
        data: args.data,
      }),
    );
  }
  setUsername(args) {
    if (connected) {
      socket.send(
        JSON.stringify({
          command: {
            type: "username",
            meta: args.data,
          },
          targets: true,
          data: args.data,
          id: Date.now(),
        }),
      );
    }
  }
  connectRoom(args) {
    if (connected) {
      socket.send(
        JSON.stringify({
          command: {
            type: "room",
          },
          targets: args.data,
        }),
      );
    }
  }
}

Scratch.extensions.register(new spriteplug());
