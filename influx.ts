import { InfluxDB, Point, HttpError } from '@influxdata/influxdb-client';
import { OrgsAPI, BucketsAPI } from '@influxdata/influxdb-client-apis';

type TemperaturePoint = {
	datum: string,
	cas: string,
	hodnota: Array<string>
};
export type Temperature = {
	teploty: {
		teplota: Array<TemperaturePoint>
	}
};

export class InfluxDBClient {
    url: string;
    token: string;
    org: string;
    _influxDB: InfluxDB;

    constructor(url: string, token: string, org: string) {
        this.url = url;
        this.token = token;
        this.org = org;
        this._influxDB = new InfluxDB({url: this.url, token: this.token});
    }

    async getBuckets(orgID: string, name: string) {
        const bucketsAPI = new BucketsAPI(this._influxDB);
        const buckets = await bucketsAPI.getBuckets({orgID, name});
        
        if(buckets && buckets.buckets && buckets.buckets.length) {
            this.log(`Bucket named "${name}" already exists`);
        }
    };

    async postBucket(orgID: string, name: string) {
        const bucketsAPI = new BucketsAPI(this._influxDB);
        const bucket = await bucketsAPI.postBuckets({body: {orgID, name}});
        this.log(JSON.stringify(
            bucket,
                (key, value) => (key === 'links' ? undefined : value),
            2	
        ));
    };

    async createBucket(name: string) {
        const orgsAPI = new OrgsAPI(this._influxDB);
        const organizations = await orgsAPI.getOrgs({org: this.org});
    
        if(!organizations || !organizations.orgs || !organizations.orgs.length) {
            console.error(`No organization name "${this.org}" found!`);
        }
        const orgID = organizations.orgs && organizations.orgs[0].id;
        this.log(`Using organization "${this.org}" identified by "${orgID}"`);
    
        try {
            await this.getBuckets(orgID as string, name);
        } catch (e) {
            if(e instanceof HttpError && e.statusCode === 404) {
                this.log("Bucket not found");
            } else {
                throw e;
            }
        }
    
        this.log(`Create Bucket ${name}`);
        try {
            await this.postBucket(orgID as string, name);
        } catch (e) {
            if(e instanceof HttpError) {
                // Ok
            }			
        }
    };

    async writeData(bucket: string, data: Temperature) {
        const writeApi = this._influxDB.getWriteApi(this.org, bucket, 'ms');
        const temperatures = data.teploty.teplota;
    
        temperatures.forEach(t => {
            const value = parseFloat(t.hodnota[0]);
            const timestamp = new Date(`${t.datum} ${t.cas}`).getTime(); 
            const point = new Point('temperature')
                .tag('temperature', 'Bohumin')
                .floatField('value', value)
                .timestamp(timestamp);
    
            writeApi.writePoint(point);	
        });
    
    
        try {
            await writeApi.close();
        } catch (e) {
            if (e instanceof HttpError && e.statusCode === 401) {
                this.log('Set up a new InfluxDB database');
            }
        }
    };
    
    async queryData(query: string) {
        const queryApi = this._influxDB.getQueryApi(this.org);
    };

    log(text: string) {
        console.log(`[+] ${text}`);
    };

};