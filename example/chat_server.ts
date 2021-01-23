import { Client, Event, Packet, Server } from "../mods.ts";

async function main() {
  const server = new Server({ port: 8080 });

  server.on(Event.listen, (server: Deno.Listener) => {
    let addr = server.addr as Deno.NetAddr;
    console.log(`Server listen ${addr.hostname}:${addr.port}`);
  });

  server.on(Event.connect, (client: Client) => {
    console.log("New Client -", client.info());
    server.broadcast(`New client connect ${client.info()}\n`, client);
  });

  server.on(Event.receive, (client: Client, data: Packet, length: number) => {
    let clearLast = data.toString().replace(/\n$/, "");
    console.log(`Receive(${length}) -`, clearLast);
    if (clearLast === "finish") {
      server.close();
    } else {
      server.broadcast(data.prepend(`From ${client.info()} : `), client);
    }
  });

  server.on(Event.close, (client: Client) => {
    console.log("Exit Client -", client.info());
    server.broadcast(`Disconnect client ${client.info()}\n`, client);
  });

  server.on(Event.shutdown, () => {
    console.log("Server is shutdown");
  });

  await server.listen();
}

main();
