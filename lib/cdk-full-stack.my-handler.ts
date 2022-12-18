import { createHandler } from "../utils";
import { z } from "zod";

export const handlerFunction = createHandler({
  path: "hello" as const,
  method: "POST" as const,
  input: z.object({
    name: z.string(),
  }),
  fn: (input) => {
    return {
      msg: `hello ${input.name}`,
    };
  },
});

export const handler = handlerFunction.handler;
