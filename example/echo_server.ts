import { Server, Client, Packet, Event } from "../mods.ts";

async function main() {
  const server = new Server({ port: 8080 });

  server.on(Event.listen, (server: Deno.Listener) => {
    let addr = <Deno.NetAddr> server.addr;
    console.log(`Server listen ${addr.hostname}:${addr.port}`);
  });

  server.on(Event.connect, (client: Client) => {
    let remote: any | Deno.NetAddr = client.conn?.remoteAddr;
    console.log("Open -", `${remote.hostname}:${remote.port}`);
  });

  server.on(Event.receive,(client: Client, data: Packet, length: number) => {
	  let origin = data.toString();
	  let message = origin.replace(/\n$/, "");
      console.log(`Receive(${length}) -`, message);
      if (message === "finish") {
        server.close();
      } else {
        client.write(origin);
      }
    },
  );

  server.on(Event.close, (client: Client) => {
    let remote: any = client.conn?.remoteAddr;
    console.log("Close -", `${remote.hostname}:${remote.port}`);
  });
  await server.listen();
}

main();
