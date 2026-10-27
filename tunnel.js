import { startTunnel } from 'untun';

async function main() {
  console.log('Starting Cloudflare tunnel for http://localhost:5173 ...');
  const tunnel = await startTunnel({
    port: 5173,
    url: 'http://localhost:5173',
    acceptCloudflareNotice: true,
  });

  if (tunnel) {
    const url = await tunnel.getURL();
    console.log('>>> CLOUDFLARE_TUNNEL_URL: ' + url + ' <<<');
  }
}

main().catch(err => {
  console.error('Tunnel error:', err);
});
