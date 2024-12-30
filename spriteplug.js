let socket = null;
let currentServer = null;
let connected = false;
let lastData = {};
let userList = "[]";
let directData = "{}";
let publicVariables = {};
let privateVariables = {};
let inRoom = false;
let hasUsername = false;
let localUser = "{}";
let privateData = "{}";
let gotNewPublicDirectData = false;
let privateDataSender = "";
let directDataSender = "";
let publicVariablesSender = {};
let privateVariablesSender = {};

function handleMessage(data) {
  lastData = JSON.parse(data);
  if (lastData.status == undefined) {
    switch (lastData.command.type) {
      case "userlist":
        userList = JSON.stringify(lastData.data);
      case "packet":
        //packet handling
        switch (lastData.command.meta) {
          case "directPrivate":
            privateData = lastData.data;
            privateDataSender = lastData.sender;
          case "direct":
            gotNewPublicDirectData = true;
            directData = lastData.data;
            directDataSender = lastData.sender;
          case "privVar":
            privateVariables[lastData.data.var] = lastData.data.val;
            privateVariablesSender[lastData.data.var] = lastData.sender;
          case "pubVar":
            publicVariables[lastData.data.var] = lastData.data.val;
            publicVariablesSender[lastData.data.var] = lastData.sender;
        }
    }
  } else {
    switch (lastData.type) {
      case "info":
        switch (lastData.originType) {
          case "info":
            hasUsername = true;
            localUser = JSON.stringify(lastData.data);
        }
      case "validate":
        switch (lastData.originType) {
          case "room":
            inRoom = true;
          case "username":
            socket.send(
              JSON.stringify({
                command: {
                  type: "info",
                  meta: null,
                },
                targets: true,
                data: null,
                id: Date.now(),
              }),
            );
        }
    }
  }
}
function resetClient() {
  lastData = {};
  socket = null;
  currentServer = null;
  connected = false;
  userList = "[]";
  directData = "{}";
  publicVariables = {};
  privateVariables = {};
  inRoom = false;
  hasUsername = false;
  localUser = "{}";
  privateData = "{}";
  gotNewPublicDirectData = false;
  privateDataSender = "";
  directDataSender = "";
  publicVariablesSender = {};
  privateVariablesSender = {};
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
          text: "Connect to [IP] room [room]",
          arguments: {
            IP: { type: Scratch.ArgumentType.STRING },
            room: { type: Scratch.ArgumentType.NUMBER },
          },
        },
        {
          opcode: "connectedState",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "Connected?",
          disableMonitor: true,
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
        {
          opcode: "getUsernames",
          blockType: Scratch.BlockType.REPORTER,
          text: "Players in room",
          disableMonitor: true,
        },
        {
          opcode: "myUser",
          blockType: Scratch.BlockType.REPORTER,
          text: "Local player object",
          disableMonitor: true,
        },
        {
          opcode: "inRoom",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "Is in room?",
          disableMonitor: true,
        },
        {
          opcode: "hasUsername",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "Username set?",
          disableMonitor: true,
        },
        "---",
        {
          opcode: "lastestData",
          blockType: Scratch.BlockType.REPORTER,
          text: "Last received data",
          disableMonitor: true,
        },
        {
          opcode: "getDirectData",
          blockType: Scratch.BlockType.REPORTER,
          text: "Direct data",
          disableMonitor: true,
        },
        {
          opcode: "getDirectDataSender",
          blockType: Scratch.BlockType.REPORTER,
          text: "Direct data sender",
          disableMonitor: true,
        },
        {
          opcode: "gotNewPublicDirectData",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "Got new public direct data?",
          disableMonitor: true,
        },
        {
          opcode: "getDirectDataPrivate",
          blockType: Scratch.BlockType.REPORTER,
          text: "Direct data private",
          disableMonitor: true,
        },
        {
          opcode: "getDirectDataPrivateSender",
          blockType: Scratch.BlockType.REPORTER,
          text: "Direct data private sender",
          disableMonitor: true,
        },
        {
          opcode: "getPubVariable",
          blockType: Scratch.BlockType.REPORTER,
          text: "Public variable [var]",
          arguments: {
            var: { type: Scratch.ArgumentType.STRING },
          },
        },
        {
          opcode: "getPubVariableSender",
          blockType: Scratch.BlockType.REPORTER,
          text: "Public variable [var] sender",
          arguments: {
            var: { type: Scratch.ArgumentType.STRING },
          },
        },
        {
          opcode: "getPrivVariable",
          blockType: Scratch.BlockType.REPORTER,
          text: "Private variable [var]",
          arguments: {
            var: { type: Scratch.ArgumentType.STRING },
          },
        },
        {
          opcode: "getPrivVariableSender",
          blockType: Scratch.BlockType.REPORTER,
          text: "Private variable [var] sender",
          arguments: {
            var: { type: Scratch.ArgumentType.STRING },
          },
        },
        "---",
        {
          opcode: "sendPacket",
          blockType: Scratch.BlockType.COMMAND,
          text: "Send direct [data]",
          arguments: {
            data: { type: Scratch.ArgumentType.STRING },
          },
        },
        {
          opcode: "sendPacketPrivate",
          blockType: Scratch.BlockType.COMMAND,
          text: "Send direct [data] to player [id] (uuid)",
          arguments: {
            data: { type: Scratch.ArgumentType.STRING },
            id: { type: Scratch.ArgumentType.STRING },
          },
        },
        {
          opcode: "sendVar",
          blockType: Scratch.BlockType.COMMAND,
          text: "Send public variable [var] value [val]",
          arguments: {
            var: { type: Scratch.ArgumentType.STRING },
            val: { type: Scratch.ArgumentType.STRING },
          },
        },
        {
          opcode: "sendVarPrivate",
          blockType: Scratch.BlockType.COMMAND,
          text: "Send private variable [var] value [val] to player [id] (uuid)",
          arguments: {
            var: { type: Scratch.ArgumentType.STRING },
            val: { type: Scratch.ArgumentType.STRING },
            id: { type: Scratch.ArgumentType.STRING },
          },
        },
      ],
    };
  }
  gotNewPublicDirectData() {
    if (gotNewPublicDirectData) {
      gotNewPublicDirectData = false;
      return true;
    } else {
      return false;
    }
  }
  getPrivVariable(args) {
    if (privateVariables[args.var] != undefined) {
      return privateVariables[args.var];
    } else {
      return "";
    }
  }
  getPrivVariableSender(args) {
    if (privateVariablesSender[args.var] != undefined) {
      return privateVariablesSender[args.var];
    } else {
      return "";
    }
  }
  inRoom() {
    return inRoom;
  }
  hasUsername() {
    return hasUsername;
  }
  myUser() {
    return localUser;
  }
  getPubVariable(args) {
    if (publicVariables[args.var] != undefined) {
      return publicVariables[args.var];
    } else {
      return "";
    }
  }
  getPubVariableSender(args) {
    if (publicVariablesSender[args.var] != undefined) {
      return publicVariablesSender[args.var];
    } else {
      return "";
    }
  }
  sendVarPrivate(args) {
    socket.send(
      JSON.stringify({
        command: {
          type: "packet",
          meta: "privVar",
        },
        targets: [args.id],
        data: { var: args.var, val: args.val },
        id: Date.now(),
      }),
    );
  }
  sendVar(args) {
    socket.send(
      JSON.stringify({
        command: {
          type: "packet",
          meta: "pubVar",
        },
        targets: true,
        data: { var: args.var, val: args.val },
        id: Date.now(),
      }),
    );
  }
  getDirectData() {
    return directData;
  }
  getDirectDataSender() {
    return directDataSender;
  }
  getDirectDataPrivate() {
    return privateData;
  }
  getDirectDataPrivateSender() {
    return privateDataSender;
  }
  getUsernames() {
    return userList;
  }
  lastestData() {
    return JSON.stringify(lastData);
  }
  openSocket(args) {
    if (socket != null) {
      console.warn("Already connected to a server.");
      return;
    }
    return newClient(args.IP + "?roomid=" + args.room);
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
  sendPacketPrivate(args) {
    socket.send(
      JSON.stringify({
        command: {
          type: "packet",
          meta: "directPrivate",
        },
        targets: [args.id],
        data: args.data,
        id: Date.now(),
      }),
    );
  }
  sendPacket(args) {
    socket.send(
      JSON.stringify({
        command: {
          type: "packet",
          meta: "direct",
        },
        targets: true,
        data: args.data,
        id: Date.now(),
      }),
    );
  }
  setUsername(args) {
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

Scratch.extensions.register(new spriteplug());
