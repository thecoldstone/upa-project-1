export class Client {
    constructor() {};

    log(text: string, status: string = 'OK') {
        console.log(`[${status === 'OK' ? '+' : '!'}] ${text}`);
    };
}