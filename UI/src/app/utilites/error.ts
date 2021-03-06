export function parseHttpError(error) {
  if (typeof error === 'string') {
    return error;
  } else if (error.error?.message) {
    return error.error.message;
  } else if (error.message) {
    return error.message;
  } else if (error.error) {
    return parseHttpError(error.error)
  } else if (error.statusText) {
    return error.statusText;
  } else {
    return null;
  }
}
