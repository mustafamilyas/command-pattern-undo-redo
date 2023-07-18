import { CSSProperties, Dispatch } from "react";

export interface CommandUtils {
  styles: CSSProperties;
  setStyles: Dispatch<React.SetStateAction<CSSProperties>>;
}

export abstract class Command<T> {
  utils: T;
  constructor(utils: T) {
    this.utils = utils;
  }
  abstract execute(): void;
  abstract undo(): void;
  abstract getInfo(): string;
}

export class ItalicCommand<T extends CommandUtils> extends Command<T> {
  prevFontStyle?: CSSProperties["fontStyle"];
  constructor(utils: T) {
    super(utils);
    this.prevFontStyle = utils.styles.fontStyle;
  }

  getNextStyle() {
    if (this.prevFontStyle === "italic") {
      return "normal";
    }
    return "italic";
  }

  execute() {
    const nextFontStyle = this.getNextStyle();
    this.utils.setStyles((prevStyles) => ({
      ...prevStyles,
      fontStyle: nextFontStyle,
    }));
  }

  undo() {
    this.utils.setStyles((prevStyles) => ({
      ...prevStyles,
      fontStyle: this.prevFontStyle,
    }));
  }

  getInfo() {
    return "Italic command : Change into " + this.getNextStyle();
  }
}

export class BoldCommand<T extends CommandUtils> extends Command<T> {
  prevFontWeight?: CSSProperties["fontWeight"];
  constructor(utils: T) {
    super(utils);
    this.prevFontWeight = utils.styles.fontWeight;
  }

  getNextStyle() {
    if (
      this.prevFontWeight === "bold" ||
      (typeof this.prevFontWeight === "number" && this.prevFontWeight >= 700)
    ) {
      return "normal";
    }
    return "bold";
  }

  execute() {
    const nextFontStyle = this.getNextStyle();
    this.utils.setStyles((prevStyles) => ({
      ...prevStyles,
      fontWeight: nextFontStyle,
    }));
  }

  undo() {
    this.utils.setStyles((prevStyles) => ({
      ...prevStyles,
      fontWeight: this.prevFontWeight,
    }));
  }

  getInfo() {
    return "Bold Command : Change into " + this.getNextStyle();
  }
}

export class UnderlineCommand<T extends CommandUtils> extends Command<T> {
  prevTextDecoration?: CSSProperties["textDecoration"];
  constructor(utils: T) {
    super(utils);
    this.prevTextDecoration = utils.styles.textDecoration;
  }

  getNextStyle() {
    if (this.prevTextDecoration === "underline") {
      return "unset";
    }
    return "underline";
  }

  execute() {
    const nextFontStyle = this.getNextStyle();
    this.utils.setStyles((prevStyles) => ({
      ...prevStyles,
      textDecoration: nextFontStyle,
    }));
  }

  undo() {
    this.utils.setStyles((prevStyles) => ({
      ...prevStyles,
      textDecoration: this.prevTextDecoration,
    }));
  }

  getInfo() {
    return "Underline command : Change into " + this.getNextStyle();
  }
}
