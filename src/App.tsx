import { CSSProperties, useMemo, useState } from "react";
import {
  BoldCommand,
  Command,
  CommandUtils,
  ItalicCommand,
  UnderlineCommand,
} from "./command";
import appStyles from "./App.module.css";

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

  const undoUntil = async (index: number) => {
    while (backHistory.length > index) {
      await undo();
    }
  };

  const redoUntil = async (index: number) => {
    while (forwardHistory.length > index) {
      await redo();
    }
  };

  const histories = useMemo(() => {
    const formattedBackHistory = backHistory.map((command, index) => ({
      type: "undo",
      command,
      message: command.getInfo(),
      onCall: () => undoUntil(index),
    }));
    const formattedForwardHistory = [...forwardHistory]
      .reverse()
      .map((command, index) => ({
        type: "redo",
        command,
        message: command.getInfo(),
        onCall: () => redoUntil(index),
      }));
    return [...formattedBackHistory, ...formattedForwardHistory];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backHistory.length, forwardHistory.length]);

  return {
    executeCommand,
    redo,
    undo,
    histories,
  };
}

export default function App() {
  const [styles, setStyles] = useState<CSSProperties>({});
  const utils = { styles, setStyles };
  const { executeCommand, redo, undo, histories } =
    useHistoryManager<CommandUtils>();

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
    <div className={appStyles.container}>
      <div className={appStyles.editor}>
        <p style={styles}>Hello from react!</p>
        <button onClick={setTextToItalic}>italic</button>
        <button onClick={setTextToBold}>bold</button>
        <button onClick={setTextToUnderline}>underline</button>
        <button onClick={undo}>undo</button>
        <button onClick={redo}>redo</button>
      </div>
      <div className={appStyles.history}>
        <h2>History</h2>
        <ol>
          {histories.map((history, index) => (
            <li key={index + history.type + history.message}>
              <button onClick={history.onCall}>{history.message}</button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
