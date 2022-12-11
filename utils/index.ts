import { Context, APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { z, ZodType } from "zod";

export class Handler<
  Input extends ZodType<any, any, any>,
  Response,
  Path,
  Method
> {
  path: Path;
  method: Method;

  input: Input;
  fn: (input: z.infer<Input>) => Response;

  constructor({
    input,
    fn,
    path,
    method,
  }: {
    input: Input;
    fn: (input: z.infer<Input>) => Response;
    path: Path;
    method: Method;
  }) {
    this.input = input;
    this.fn = fn;
    this.method = method;
    this.path = path;
  }

  async handler(
    event: APIGatewayEvent,
    _context: Context
  ): Promise<APIGatewayProxyResultV2> {
    return {
      statusCode: 200,
      body: JSON.stringify(this.fn(this.input.parse(event.body))),
    };
  }
}

export type GetHandlerType<C extends Handler<any, any, any, any>> =
  C extends Handler<infer Input, infer Response, infer Path, infer Method>
  ? (body: z.infer<Input>, path: Path, mehtod: Method) => Promise<Response>
  : unknown;
