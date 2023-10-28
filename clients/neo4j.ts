import neo4j from "neo4j-driver/lib/browser/neo4j-web.esm.js";
import { Client } from "./client";

export class Neo4jClient extends Client {
  _driver?: neo4j.Driver;

  constructor() {
    super();
  }

  async connect(url: string, user: string, password: string) {
    try {
      this.log("Connecting to Neo4j...");
      this._driver = neo4j.driver(url, neo4j.auth.basic(user, password));
      const serverInfo = await this._driver.getServerInfo();

      this.log("Connected to Neo4j");
      this.log(`Neo4j Server info: 
		     ${serverInfo.address}, 
		     ${serverInfo.agent}, 
		     ${serverInfo.protocolVersion}`);
    } catch (err) {
      this.log(`Error connecting to Neo4j: ${err}`, "ERROR");
      await this._driver?.close();
    }
  }

  async query(query: string) {
    switch (query) {
      case "architects":
        await this._queryArchitects();
        break;
      default:
        await this._query(query);
    }
  };

  async _queryArchitects() {
    const { records, summary, keys } = await this._driver?.executeQuery(
      "match (a:Architect) return a.name as name",
      {},
      { database: "neo4j" },
    )

    for (const record of records) {
      this.log(`${record.get("name")}`);
    }
  };

  async _query(query: string) {
	const { records, summary, keys } = await this._driver?.executeQuery(query, {}, {database: "neo4j"});

	for (const record of records) {
		this.log(`${JSON.stringify(record.get(keys[0]))}`);
	}
  };

  async close() {
    this.log("Closing Neo4j connection");
    await this._driver?.close();
  };
};
