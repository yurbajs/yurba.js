export class YJSError extends Error {
  hint?: string;
  code?: number;
  [key: string]: any;

  constructor(
    message: string,
    options: { hint?: string; code?: number; [key: string]: any } = {}
  ) {
    super(message);
    this.name = "YurbajsError";
    if (options.hint) this.hint = options.hint;
    if (options.code) this.code = options.code;

    for (const key in options) {
      if (key !== "hint" && key !== "code") {
        this[key] = options[key];
      }
    }
  }
}


