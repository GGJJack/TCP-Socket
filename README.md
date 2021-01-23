# Deno base TCP Socket library

![version](https://img.shields.io/badge/version-0.0.1-success)
![deno version](https://img.shields.io/badge/deno-1.6.0-success)

> TCP socket library for Deno

# Getting Started

## Import

```TypeScript
import { Server } from "https://deno.land/x/TCPSocket@0.0.1/mod.ts";
// or
import { Client } from "https://deno.land/x/TCPSocket@0.0.1/mod.ts";
```

## Basic

### Server

```TypeScript
import { Server } from "https://deno.land/x/TCPSocket@0.0.1/mod.ts";

const server = new Server({ port: 8080 });
await server.listen();
```

### Client

```TypeScript
import { Client, Event, Packet } from "https://deno.land/x/TCPSocket@0.0.1/mod.ts";

const client = new Client({ hostname: "127.0.0.1", port: 8080 });
await client.connect();
await client.write("Hello World!");
```

# Usage

## Server

```TypeScript
const server = new Server({ port: 8080 });

// Server listen
server.on(Event.listen, (server: Deno.Listener) => {
  let addr = server.addr as Deno.NetAddr;
  console.log(`Server listen ${addr.hostname}:${addr.port}`);
});

// Client connect
server.on(Event.connect, (client: Client) => {
  console.log("New Client -", client.info());
});

// Receive packet
server.on(Event.receive, (client: Client, data: Packet, length: number) => {
  console.log("Receive -", data.toString());
});

// Client close
server.on(Event.close, (client: Client) => {
  console.log("Client close -", client.info());
});

// Server finish
server.on(Event.shutdown, () => {
  console.log("Server is shutdown");
});

// Handle error
server.on(Event.error, (e) => {
  console.error(e);
});

// Do
await server.listen(); // Start listen
server.broadcast("Hello")
server.broadcast("Hello", client) //Ignore broadcast
server.broadcast("Hello", [client]) //Ignore broadcast
```

## Client

```TypeScript
import { Client, Packet, Event } from "https://deno.land/x/TCPSocket@0.0.1/mod.ts";

const client = new Client({ hostname: "127.0.0.1", port: 8080 });

// Connection open
client.on(Event.connect, (client: Client) => {
  console.log("Connect", client.conn?.remoteAddr);
});

// Receive message
client.on(Event.receive, (client: Client, data: Packet) => {
  console.log("Receive", data.toString());
});

// Connection close
client.on(Event.close, (client: Client) => {
  console.log("Close");
});

// Handle error
client.on(Event.error, (e) => {
  console.error(e);
});

// Do
await client.connect(); // Start client connect
await client.write("Hello World"); // Send string data
await client.write(new Uint8Array()); // Send Uint8Array data
client.close();
```

## Packet

```TypeScript
const packet = new Packet();
const packetFromUint8Array = new Packet(new Uint8Array());
const packetFromString = new Packet("Hello");
const packetFromPacket = new Packet(packet);

packet.toString(); // Type of string
packet.toData(); // Type of Uint8Array
packet.length(); // Type of number

packet.append(packetFromString) // Add content to the end of the packet 
packet.prepend(packetFromString) // Add content at the beginning of packet
```

# Examples

- [Echo server](example/echo_server.ts) Echo server
- [Chat server](example/chat_server.ts) TCP Chat
- [Client](example/simple_client.ts) TCP Client

# License

See [MIT License](LICENSE). All rights reserved. GGalJJak 2021.
