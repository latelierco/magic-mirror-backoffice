
export class StandError extends Error {
  constructor(message, causeErr) {
    const stdMessage = '[STANDARD ERROR] ' + (message ??= '');
    super(stdMessage, { cause: !!causeErr && causeErr || 'UNKNOW' })
  }
}


export class AddUserPhotosError extends StandError {
  constructor(message, causeErr) {
    const stdMessage = '[ADD USER PHOTOS ERROR] ' + (message ??= '');
    super(stdMessage, causeErr)
  }
}


export class GetExistingPhotosError extends StandError {
  constructor(message, causeErr) {
    const stdMessage = '[GET USER PHOTOS ERROR] ' + (message ??= '');
    super(stdMessage, causeErr)
  }
}


export class SaveUserPhotosError extends StandError {
  constructor(message, causeErr) {
    const stdMessage = '[SAVE USER PHOTOS ERROR] ' + (message ??= '');
    super(stdMessage, causeErr)
  }
}
