import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

// create a global event emitter (could be replaced by redis, etc)

type Message = { text: string; id?: string };
const messages: Message[] = [];

export const messagesRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    return messages;
  }),
  add: publicProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        text: z.string().min(1),
      }),
    )
    .mutation(async (opts) => {
      const input = { ...opts.input };
      messages.push({
        id: String(messages.length + 1),
        text: input.text,
      });
      opts.ctx.ee.emit("add", input);
      return input;
    }),
  onAdd: publicProcedure.subscription(({ ctx }) => {
    // return an `observable` with a callback which is triggered immediately
    return observable<Message>((emit) => {
      const onAdd = (data: Message) => {
        // emit data to client
        emit.next(data);
      };

      // trigger `onAdd()` when `add` is triggered in our event emitter
      ctx.ee.on("add", onAdd);

      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ctx.ee.off("add", onAdd);
      };
    });
  }),
});
