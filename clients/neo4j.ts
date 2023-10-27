import neo4j from 'neo4j-driver/lib/browser/neo4j-web.esm.js';
import { Client } from './client';

export class Neo4jClient extends Client {
    _driver?: neo4j.Driver;

    constructor() {
        super();
    };

    async connect(url: string, user: string, password: string) {
        try {
            this.log("Connecting to Neo4j...");
            this.log(`URL: ${url}, USER: ${user}, PWD: ${password}`);

            this._driver = neo4j.driver(url, neo4j.auth.basic(user, password), {
                logging: {
                    level: 'debug',
                    logger: (level, message) => this.log(`[${level}] ${message}`)
                },
            });
            const serverInfo = await this._driver.getServerInfo();

            this.log("Connected to Neo4j");
            this.log(`Neo4j Server info: ${serverInfo}`);

        } catch(err) {
            this.log(`Error connecting to Neo4j: ${err}`, 'ERROR');
            await this._driver?.close();
        }
    };

    async query(query: string) {
        const result = await this._driver?.executeQuery(query, {}, {
            resultTransformer: neo4j.resultTransformers.mappedResultTransformer({
                map(record) {
                    return record.get("name")
                }
            })
        });
        
        this.log(`Query result: ${result}`);
    };    

    async close() {
        this.log("Closing Neo4j connection");
        await this._driver?.close();
    };
};
