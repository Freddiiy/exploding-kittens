import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import EventEmitter from "events";

// create a global event emitter (could be replaced by redis, etc)

type Message = { text: string; id?: string };
const messages: Message[] = [];

export const gameRouter = createTRPCRouter({
  get: publicProcedure.query(async (opts) => {
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
      const input = { ...opts.input }; /* [..] add to db */
      opts.ctx.ee.emit("add", input);
      return input;
    }),
  onAdd: publicProcedure.subscription(({ ctx }) => {
    // return an `observable` with a callback which is triggered immediately
    return observable<Message>((emit) => {
      const onAdd = (data: Message) => {
        // emit data to client
        messages.push(data);
        emit.next(data);
      };

      // trigger `onAdd()` when `add` is triggered in our event emitter
      ctx.ee.on("add", onAdd);

      console.log(ctx.ee);

      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ctx.ee.off("add", onAdd);
      };
    });
  }),
});
