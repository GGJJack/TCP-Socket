import { Client, Packet, Event } from "../mods.ts";

async function echo(listener: Deno.Listener) {
  for await (const conn of listener) {
    Deno.copy(conn, conn).finally(() => conn.close());
  }
}

async function simpleClient() {
  const listener = Deno.listen({ port: 8080 });
  console.log("listening on 0.0.0.0:8080");
  echo(listener);

  const client = new Client({ hostname: "127.0.0.1", port: 8080 });
  client.on(Event.error, (e) => {
    console.error(e);
  });
  client.on(Event.connect, (client: Client) => {
    console.log("Connect", client.conn?.remoteAddr);
    client.write("Hello World");
  });
  client.on(Event.receive, (client: Client, data: Packet) => {
    console.log(data.toString());
    client.close();
  });
  client.on(Event.close, (client: Client) => {
    console.log("Close");
    listener.close();
  });
  client.connect();
}

async function main() {
  simpleClient();
}

main();
