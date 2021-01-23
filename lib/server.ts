import { Client, Event, EventEmitter, Packet, SocketOption } from "../mods.ts";

export class Server extends EventEmitter {
  clients: Client[] = [];
  server?: Deno.Listener;
  listening?: Promise<any>;
  isOpen: boolean = false;

  constructor(public options: SocketOption) {
    super();
    options.chunkSize = options.chunkSize || 1024 * 1024
  }

  async listen() {
    const server = Deno.listen(this.options);
    this.emit(Event.listen, server);
    this.server = server;
    try {
      this.isOpen = true;
      for await (const conn of server) {
        let client = new Client();
        this.clients.push(client);
        client.open(conn);
        this.emit(Event.connect, client);
        client.on(Event.receive, (client, data, length) => {
          this.emit(Event.receive, client, data, length);
        });
        client.on(Event.close, (client) => {
          this.closeClient(client);
        });
      }
    } catch (e) {
      this.emit(Event.error, e);
    }
  }

  async broadcast(
    data: Uint8Array | string | Packet,
    ignore?: Client[] | Client,
  ) {
    for (let client of this.clients) {
      let ignored = -1;
      if (ignore instanceof Array && 0 < ignore.length) {
        ignored = ignore.indexOf(client);
      }

      if (ignored < 0) {
        if (ignore !== client && client.isOpen) client.write(data);
      } else if (ignore instanceof Array) {
        ignore?.splice(ignored, 1);
      }
    }
  }

  async closeClient(client: Client) {
    if (client.isOpen) {
      this.emit(Event.close, client);
      const index = this.clients.indexOf(client, 0);
      if (0 <= index) {
        this.clients.splice(index, 1);
      }
      try {
        client.close();
      } catch (err) {
      }
    } else {
      this.emit(Event.close, client);
      const index = this.clients.indexOf(client, 0);
      if (0 <= index) {
        this.clients.splice(index, 1);
      }
    }
  }

  async close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.emit(Event.shutdown, this.server);
      let list: Client[] = Object.assign([], this.clients);
      for (let client of list) {
        if (client.isOpen) client.close();
      }
      this.server?.close();
    }
  }
}
