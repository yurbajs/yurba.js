import { ErrorCodes } from './ErCodes';
import { Messages } from './ErMessages';

function makeYurbajsError(Base: ErrorConstructor) {
  return class extends Base {
    static {
      Object.defineProperty(this, 'name', { value: `Yurbajs${Base.name}` });
    }

    code: string;

    constructor(code: keyof typeof ErrorCodes, ...args: any[]) {
      super(message(code, args));
      this.code = code;
      Error.captureStackTrace(this, this.constructor);
    }

    get name() {
      return `${this.constructor.name} [${this.code}]`;
    }
  };
}

function message(code: keyof typeof ErrorCodes, args: any[]): string {
  if (!(code in ErrorCodes)) throw new Error('Error code must be a valid YurbajsErrorCodes');
  const msg = Messages[code as keyof typeof Messages] as string | ((...args: any[]) => string);
  if (!msg) throw new Error(`No message associated with error code: ${code}.`);
  if (typeof msg === 'function') return msg(...args);
  if (!args?.length) return msg as string;
  return `${msg} ${args.join(' ')}`;
}

export const YurbajsError = makeYurbajsError(Error);
export const YurbajsTypeError = makeYurbajsError(TypeError);
export const YurbajsRangeError = makeYurbajsError(RangeError);
