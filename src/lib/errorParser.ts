import { ApiError } from "aptos";
const errorParser = (error: unknown, defaultResponse: string): string => {
  let response = defaultResponse;
  if (error instanceof ApiError) {
    if (error.message) {
      try {
        const maybeObject = JSON.parse(error.message);
        if (maybeObject && maybeObject.message) {
          response = maybeObject.message;
        } else {
          response = error.message;
        }
      } catch (parsingError) {
        response = error.message;
      }
    }
  } else if (error instanceof Error) {
    response = error.message;
  }
  return response;
};
export default errorParser;
