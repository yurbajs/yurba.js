import { ErrorCodes } from './ErCodes';

const Messages = {
  [ErrorCodes.TokenInvalid]: 'An invalid token was provided.',
  [ErrorCodes.TokenMissing]: 'Token is missing from the request.'
};

export { Messages };