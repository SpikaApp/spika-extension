const errorParser = (error: unknown, defaultResponse: string): string => {
  let response = defaultResponse;
  if (error instanceof Error) {
    response = error.message;
  }
  return response;
};
export default errorParser;
