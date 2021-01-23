export interface SocketOption extends Deno.ConnectOptions {
  chunkSize?: number;
}

export enum Event {
  listen = "listen",
  shutdown = "shutdown",
  connect = "connect",
  close = "close",
  receive = "receive",
  error = "error",
}