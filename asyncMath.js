let mathList = {};
let mathResults = {};
let tasks = [];
let taskLength = 0;
let step = 0;
let frameRate = 33.333333333333336;
let displayFps = 30;
let isTW = false;

// This check is for TurboWarp compatibility
if (vm.runtime.variables == undefined) {
  isTW = true;
  vm.runtime.variables = {};
}

if (vm.runtime.lmsTempVars2 == undefined) {
  if (isTW) {
    vm.extensionManager.loadExtensionURL(
      "https://extensions.turbowarp.org/Lily/TempVariables2.js",
    );
  } else {
    vm.extensionManager.loadExtensionIdSync("lmsTempVars2");
  }
}

function updateMathList() {
  tasks = Object.keys(mathList);
  taskLength = Object.keys(mathList).length;
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const calculate = async () => {
  for (step = 0; step < taskLength; step++) {
    mathResults[tasks[step]] = eval(mathList[tasks[step]]);
  }
  await delay(frameRate);
  calculate();
};

calculate();

class threadMath {
  getInfo() {
    return {
      id: "threadMath",
      name: "Async Math",
      blocks: [
        {
          opcode: "addmath",
          blockType: Scratch.BlockType.COMMAND,
          text: "Add math thread ID [ID] equation [MATH]",
          arguments: {
            ID: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: "myEquation",
            },
            MATH: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: "25*Date.now()",
            },
          },
        },
        {
          opcode: "getmathresult",
          blockType: Scratch.BlockType.REPORTER,
          text: "Get result for ID [ID]",
          arguments: {
            ID: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: "myEquation",
            },
          },
        },
        {
          opcode: "gettasks",
          blockType: Scratch.BlockType.REPORTER,
          text: "Math threads",
          disableMonitor: true,
        },
        "---",
        {
          opcode: "removemath",
          blockType: Scratch.BlockType.COMMAND,
          text: "Remove math thread ID [ID]",
          arguments: {
            ID: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: "myEquation",
            },
          },
        },
        {
          opcode: "removecache",
          blockType: Scratch.BlockType.COMMAND,
          text: "Remove math cache ID [ID]",
          arguments: {
            ID: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: "myEquation",
            },
          },
        },
        "---",
        {
          opcode: "setFrameRate",
          blockType: Scratch.BlockType.COMMAND,
          text: "Set math frame rate [FPS]",
          arguments: {
            FPS: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 30,
            },
          },
        },
        {
          opcode: "getFrameRate",
          blockType: Scratch.BlockType.REPORTER,
          text: "Math frame rate",
        },
      ],
    };
  }
  gettasks() {
    return JSON.stringify(tasks);
  }
  getFrameRate() {
    return displayFps;
  }

  setFrameRate(args) {
    frameRate = (1 / args.FPS) * 1000;
    displayFps = args.FPS;
  }

  addmath(args) {
    try {
      let tempEq = args.MATH;
      // I am sorry for writing this. I had to do it this way for readability
      // You are not supposed to update these often anyway
      if (isTW) {
        tempEq = tempEq.replace(
          "var[",
          "vm.runtime.ext_lmsTempVars2.runtimeVariables[",
        );
      } else {
        tempEq = tempEq.replace("var[", "vm.runtime.variables[");
      }
      tempEq = tempEq.replace("abs(", "Math.abs(");
      tempEq = tempEq.replace("cos(", "Math.cos(");
      tempEq = tempEq.replace("sin(", "Math.sin(");
      tempEq = tempEq.replace("max(", "Math.max(");
      tempEq = tempEq.replace("min(", "Math.min(");
      tempEq = tempEq.replace("floor(", "Math.floor(");
      tempEq = tempEq.replace("sqrt(", "Math.sqrt(");

      mathList[args.ID] = tempEq;
      if (typeof eval(mathList[args.ID]) != "number") {
        console.log(mathList[args.ID]);
        throw new Error("Result is not a number");
      }
      updateMathList();
    } catch (err) {
      delete mathList[args.ID];
      updateMathList();
      console.log(err);
    }
  }
  removecache(args) {
    delete mathResults[args.ID];
  }
  removemath(args) {
    delete mathList[args.ID];
    updateMathList();
  }
  getmathresult(args) {
    if (mathResults[args.ID] == undefined) {
      return "";
    } else {
      return mathResults[args.ID];
    }
  }
}

Scratch.extensions.register(new threadMath());
