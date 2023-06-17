import { CSSProperties, useState } from "react";
import {
  BoldCommand,
  Command,
  CommandUtils,
  ItalicCommand,
  UnderlineCommand,
} from "./command";
import styles from "./App.module.css";

function useHistoryManager<T>() {
  const [forwardHistory, setForwardHistory] = useState<Command<T>[]>([]);
  const [backHistory, setBackHistory] = useState<Command<T>[]>([]);

  const executeCommand = async (command: Command<T>) => {
    // clear forward history
    setForwardHistory([]);
    await command.execute();
    setBackHistory((prev) => [...prev, command]);
  };
  const redo = async () => {
    if (!forwardHistory.length) return;
    const topRedoCommand = forwardHistory[forwardHistory.length - 1];
    await topRedoCommand.execute();
    setForwardHistory((prev) => prev.slice(0, -1));
    setBackHistory((prev) => [...prev, topRedoCommand]);
  };
  const undo = async () => {
    if (!backHistory.length) return;
    const topUndoCommand = backHistory[backHistory.length - 1];
    await topUndoCommand.undo();
    setBackHistory((prev) => prev.slice(0, -1));
    setForwardHistory((prev) => [...prev, topUndoCommand]);
  };
  return {
    forwardHistory,
    backHistory,
    executeCommand,
    redo,
    undo,
  };
}

export default function App() {
  const [styles, setStyles] = useState<CSSProperties>({});
  const utils = { styles, setStyles };
  const { executeCommand, redo, undo } = useHistoryManager<CommandUtils>();

  const setTextToItalic = async () => {
    const italicCommand = new ItalicCommand(utils);
    await executeCommand(italicCommand);
  };

  const setTextToBold = async () => {
    const boldCommand = new BoldCommand(utils);
    await executeCommand(boldCommand);
  };

  const setTextToUnderline = async () => {
    const underlineCommand = new UnderlineCommand(utils);
    await executeCommand(underlineCommand);
  };

  return (
    <div className="App">
      <p style={styles}>Hello from react!</p>
      <button onClick={setTextToItalic}>italic</button>
      <button onClick={setTextToBold}>bold</button>
      <button onClick={setTextToUnderline}>underline</button>
      <button onClick={undo}>undo</button>
      <button onClick={redo}>redo</button>
    </div>
  );
}
