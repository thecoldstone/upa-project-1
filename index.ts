import { InfluxDBClient, Temperature } from "./clients/influx";
import { Neo4jClient } from "./clients/neo4j";
import { program } from "commander";
import { Parser } from "xml2js";

/**
 * @todo reading file from stdin
 */
program
  .command("influx")
  .description("CLI for InfluxDB")
  .option(
    "-f, --file [items...]",
    "XML file to parse, where [file] [bucketName]",
  )
  .option("-q, --query", "Query to execute")
  .option("-p, --ping", "Ping InfluxDB")
  .action(async (options) => {
    const url = process.env.URL || "http://localhost:8086";
    const token = process.env.TOKEN || "dummy-token";
    const org = process.env.ORGANIZATION || "dummy-organization";
    const bucketName = process.env.BUCKET || "dummy-bucket";
    const influxDB = new InfluxDBClient(url, token, org);

    if (options.file) {
      const xmlFile = Bun.file(options.file[0]);
      const xmlText = await xmlFile.text();
      const parserXML = new Parser();
      const data = (await parserXML.parseStringPromise(xmlText)) as Temperature;

      influxDB.writeData(bucketName, data);
    }
    if (options.query) {
      influxDB.queryData();
    }
    if (options.ping) {
      influxDB.ping();
    }
  });

program
  .command("neo4j")
  .description("CLI for Neo4j")
  .option(
    "-f, --file [items...]",
    "CSV file to parse, where [file] [bucketName]",
  )
  .option("-q, --query <string>", "Query to execute")
  .action(async (options) => {
    const url = process.env.NEO4J_URL || "bolt://localhost:7687";
    const user = process.env.NEO4J_USR || "neo4j";
    const password = process.env.NEO4J_PWD || "neo4j";
    const neo4j = new Neo4jClient();

    await neo4j.connect(url, user, password);

    if (options.query) {
      await neo4j.query(options.query);
    }

    await neo4j.close();
  });

program.parse(Bun.argv);
