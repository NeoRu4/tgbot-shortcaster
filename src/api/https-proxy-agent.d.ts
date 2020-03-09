declare module 'https-proxy-agent' {
    import * as https from 'https'


    interface HttpsProxyAgentOptions {
        host: string
        port: number
        secureProxy?: boolean
        headers?: {
            [key: string]: string
        }
        [key: string]: any
    }
    
    
    // HttpsProxyAgent doesnt *actually* extend https.Agent, but for my purposes I want it to pretend that it does
    export class HttpsProxyAgent extends https.Agent {
        constructor(opts: HttpsProxyAgentOptions)
        
    }

}