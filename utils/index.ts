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
    console.log("THIS", this);
    console.log("INPUT", this.input);
    const result = this.input.safeParse(event.body);

    if (!result.success) {
      return {
        statusCode: 403,
        body: JSON.stringify(result.error),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(this.fn(result.data)),
    };
  }
}

// export type GetHandlerType<C extends Handler<any, any, any, any>> =
//   C extends Handler<infer Input, infer Response, infer Path, infer Method>
//     ? (body: z.infer<Input>, path: Path, mehtod: Method) => Promise<Response>
// : unknown;

export function createHandler<
  Input extends ZodType<any, any, any>,
  Response,
  Path,
  Method
>({
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
  return {
    handler: async (
      event: APIGatewayEvent,
      _context: Context
    ): Promise<APIGatewayProxyResultV2> => {
      const result = input.safeParse(JSON.parse(event.body ?? ""));

      if (!result.success) {
        return {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "application/json",
          },
          statusCode: 403,
          body: JSON.stringify(result.error),
        };
      }

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fn(result.data)),
      };
    },
    input,
    fn,
    path,
    method,
  };
}

export type CreateHandlerType<C extends ReturnType<typeof createHandler>> = (
  body: z.infer<C["input"]>,
  path: C["path"],
  method: C["method"]
) => Promise<ReturnType<C["fn"]>>;

export type CreateHandlerPath<C extends ReturnType<typeof createHandler>> =
  C["path"];
export type CreateHandlerMethod<C extends ReturnType<typeof createHandler>> =
  C["method"];
