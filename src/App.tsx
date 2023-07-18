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

  const histories = useMemo(() => {
    const formattedBackHistory = backHistory.map((command, index) => ({
      type: "undo",
      command,
      message: command.getInfo(),
    }));
    const formattedForwardHistory = [...forwardHistory]
      .reverse()
      .map((command, index) => ({
        type: "redo",
        command,
        message: command.getInfo(),
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
        <p className={appStyles.mainText} style={styles}>
          Hello from react!
        </p>
        <div className={appStyles.actions}>
          <button
            className={appStyles.button}
            onClick={setTextToItalic}
            title="italic"
          >
            <img src="/assets/format_italic.svg" alt="italic" />
          </button>
          <button
            className={appStyles.button}
            onClick={setTextToBold}
            title="bold"
          >
            <img src="/assets/format_bold.svg" alt="bold" />
          </button>
          <button
            className={appStyles.button}
            onClick={setTextToUnderline}
            title="underline"
          >
            <img src="/assets/format_underline.svg" alt="underline" />
          </button>
          <button className={appStyles.button} onClick={undo} title="undo">
            <img src="/assets/undo.svg" alt="undo" />
          </button>
          <button className={appStyles.button} onClick={redo} title="redo">
            <img src="/assets/redo.svg" alt="redo" />
          </button>
        </div>
      </div>
      <div className={appStyles.history}>
        <h2 className={appStyles.historyHeader}>History</h2>
        <ol className={appStyles.historyContent}>
          <li className={`${appStyles.historyItem}`}>
            <button>Initial</button>
          </li>
          {histories.map((history, index) => (
            <li
              className={`${appStyles.historyItem} ${
                history.type === "undo" ? appStyles.undo : appStyles.redo
              }`}
              key={index + history.type + history.message}
            >
              <button>{history.message}</button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
