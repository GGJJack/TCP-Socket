import { Event, EventEmitter, Packet, SocketOption } from "../mods.ts";

const encoder = new TextEncoder();

export class Client extends EventEmitter {
  conn?: Deno.Conn;
  isOpen: boolean = false;
  options: SocketOption;

  constructor(options?: SocketOption) {
    super();
    this.options = {
      port: options?.port || 8080,
      transport: options?.transport || "tcp",
      chunkSize: options?.chunkSize || 1024 * 1024
    };
  }

  async connect() {
    try {
      const conn = await Deno.connect(this.options);
      this.open(conn);
    } catch (e) {
      this.emit(Event.error, this, e);
      this.close();
    }
  }

  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.emit(Event.close, this);
      this.conn?.close();
    }
  }

  info(): string {
    if (this.conn?.remoteAddr as Deno.NetAddr) {
      let remote = <Deno.NetAddr> this.conn?.remoteAddr;
      return `[${remote.transport}] ${remote.hostname}:${remote.port} { isOpen: ${this.isOpen} }`;
    } else {
      return JSON.stringify(this.conn);
    }
  }

  async open(conn: Deno.Conn) {
    try {
      this.isOpen = true;
      this.conn = conn;
	  this.emit(Event.connect, this);

	  for await (const buffer of Deno.iter(conn, {bufSize: this.options.chunkSize!})) {
		  this.emit(Event.receive, this, new Packet(buffer), buffer.length)
	  }
      this.close();
    } catch (e) {
      if (e instanceof Deno.errors.BadResource) {
        this.close();
      } else {
        this.emit(Event.error, this, e);
        this.close();
      }
    }
  }

  async write(data: Uint8Array | string | Packet): Promise<number> {
	let write = await this.conn?.write(new Packet(data).toData());
	return Promise.resolve(<number>write)
  }
}
