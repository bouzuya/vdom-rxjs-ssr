type Initializer<State> = (params: InitializerParameters) => Promise<State>;
type InitializerName = string;
type InitializerParameters = { [name: string]: string };

export {
  Initializer,
  InitializerName,
  InitializerParameters,
};