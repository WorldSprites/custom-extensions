// with love from TheShovel <3

var inputBox = document.createElement("input");
inputBox.type = "text";
inputBox.value = "";
inputBox.name = "inputboxext_input";
inputBox.style = "width:0px";
document.body.appendChild(inputBox);

class inputbox {
  getInfo() {
    return {
      id: "inputbox",
      name: "Input Box",
      blocks: [
        {
          opcode: "focus",
          blockType: Scratch.BlockType.COMMAND,
          text: "Focus input box",
        },
        {
          opcode: "get",
          blockType: Scratch.BlockType.REPORTER,
          text: "Input value",
        },
        {
          opcode: "isFocused",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "Is input focused?",
        },
        {
          opcode: "set",
          blockType: Scratch.BlockType.COMMAND,
          text: "Set input value [TEXT]",
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: "epic value",
            },
          },
        },
      ],
    };
  }
  isFocused() {
    return document.activeElement.name == "inputboxext_input";
  }
  get() {
    return inputBox.value;
  }
  focus() {
    inputBox.focus();
  }
  set(args) {
    inputBox.value = args.TEXT;
  }
}

Scratch.extensions.register(new inputbox());
