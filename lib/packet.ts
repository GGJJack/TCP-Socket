const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class Packet {
  data: Uint8Array;

  constructor(data?: Uint8Array | string | Packet) {
    if (data === undefined) {
      this.data = new Uint8Array();
    } else {
      this.data = this.toUint8Array(data);
    }
  }

  append(data: Uint8Array | string | Packet): Packet {
    this.data = new Uint8Array([...this.data, ...this.toUint8Array(data)]);
    return this;
  }

  prepend(data: Uint8Array | string | Packet): Packet {
    this.data = new Uint8Array([...this.toUint8Array(data), ...this.data]);
    return this;
  }

  //TODO
  // appendTo(index: number, data: Uint8Array | string | Packet): Packet {
  // }

  toString(): string {
    return decoder.decode(this.data);
  }

  toData(): Uint8Array {
    return this.data;
  }

  length(): number {
    return this.data.length;
  }

  private toUint8Array(data: Uint8Array | string | Packet): Uint8Array {
    if (typeof data === "string") {
      return encoder.encode(<string> data);
    } else if (data instanceof Packet) {
      return data.data;
    } else {
      return data;
    }
  }
}
