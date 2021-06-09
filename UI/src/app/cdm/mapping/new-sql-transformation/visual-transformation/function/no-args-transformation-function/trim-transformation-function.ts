import { NoArgsTransformationFunction } from '@mapping/new-sql-transformation/visual-transformation/function/no-args-transformation-function/no-args-transformation-function';

export class TrimTransformationFunction extends NoArgsTransformationFunction {

  sql(): (arg: string) => string {
    return (arg: string) => `TRIM(${arg})`;
  }
}
