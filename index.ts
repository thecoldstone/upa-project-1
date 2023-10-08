import { InfluxDBClient, Temperature } from "./influx";
import { OptionValues, program } from "commander";
import { Parser } from 'xml2js';

const url = process.env.URL || 'http://localhost:8086';
const token = process.env.TOKEN || 'dummy-token';
const org = process.env.ORGANIZATION || 'dummy-organization';

program
	.command("influx")
	.description("CLI for InfluxDB")
	.option('-f, --file <string>', 'XML file to parse')
	.option('-q, --query <string>', 'Query to execute')
	.action(async (options) => {
		const influxDB = new InfluxDBClient(url, token, org);
		
		if(options.file) {
			// TODO
		} 
		if(options.query) {
			
		}
	});

program.parse(Bun.argv);

// const xmlFile = Bun.file(Bun.argv[2]);
// const xmlText = await xmlFile.text();
// const bucket = Bun.argv[3];

// log(`Parsing xml file ${Bun.argv[2]}`);
// const parserXML = new Parser();
// const data = await parserXML.parseStringPromise(xmlText) as Temperature;

// try {
// 	await createBucket(bucket);
// 	await writeData(bucket, data);
// 	console.log('\n[+] Finished SUCCESS');
// } catch (e) {
// 	console.log('\n[!] Finished ERROR');
// }
