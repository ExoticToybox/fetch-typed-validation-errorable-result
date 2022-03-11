export type Converter<R, T> = {
  convert: (response: R) => T;
};

export class ArrayConverterFactory {
  static create<R, T>(converter: Converter<R, T>): Converter<R[], T[]> {
    return {
      convert: (responses: R[]) =>
        responses.map((response: R) => converter.convert(response)),
    };
  }
}
