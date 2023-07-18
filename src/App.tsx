import { CSSProperties, useMemo, useRef, useState } from "react";
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
  const topForwardIndexRef = useRef(-1);
  const topBackIndexRef = useRef(-1);

  const executeCommand = async (command: Command<T>) => {
    // clear forward history
    setForwardHistory([]);
    topForwardIndexRef.current = -1;
    await command.execute();
    setBackHistory((prev) => [...prev, command]);
    topBackIndexRef.current++;
  };
  const redo = async () => {
    if (!forwardHistory.length || topForwardIndexRef.current === -1) return;
    const topRedoCommand = forwardHistory[topForwardIndexRef.current];
    await topRedoCommand.execute();
    setForwardHistory((prev) => prev.slice(0, -1));
    setBackHistory((prev) => [...prev, topRedoCommand]);
    topForwardIndexRef.current--;
    topBackIndexRef.current++;
  };
  const undo = async () => {
    if (!backHistory.length || topBackIndexRef.current === -1) return;
    const topUndoCommand = backHistory[topBackIndexRef.current];
    await topUndoCommand.undo();
    setBackHistory((prev) => prev.slice(0, -1));
    setForwardHistory((prev) => [...prev, topUndoCommand]);
    topBackIndexRef.current--;
    topForwardIndexRef.current++;
  };

  const undoUntil = async (index: number) => {
    for (let i = backHistory.length - 1; i > index; i--) {
      await undo();
    }
  };

  const redoUntil = async (index: number) => {
    for (let i = forwardHistory.length - 1; i > index; i--) {
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
          <li className={appStyles.historyItem}>
            <button>Initial State</button>
          </li>
          {histories.map((history, index) => (
            <li
              className={`${appStyles.historyItem} ${
                history.type === "undo" ? appStyles.undo : appStyles.redo
              }`}
              key={index + history.type + history.message}
            >
              <button onClick={history.onCall}>{history.message}</button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
