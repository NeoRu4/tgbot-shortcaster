import * as Https  from 'https';
import * as HttpProxy from 'http-proxy';


export interface ProxySettings {
    target: string,
    listenPort: number
}

export class ProxyServer {

    public proxyServer: HttpProxy;

    constructor(options: ProxySettings) {

        this.proxyServer = HttpProxy.createProxyServer({
            agent: Https.globalAgent,
            target: options.target
        });

        this.proxyServer.listen(options.listenPort);
    }
}