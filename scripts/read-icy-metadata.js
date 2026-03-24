const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    result[key] = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }

  return result;
}

function getStreamUrl() {
  const localEnv = loadEnvFile(path.join(process.cwd(), '.env.local'));
  const exampleEnv = loadEnvFile(path.join(process.cwd(), '.env.example'));

  return (
    process.argv[2] ||
    process.env.EXPO_PUBLIC_LIVE_STREAM_URL ||
    localEnv.EXPO_PUBLIC_LIVE_STREAM_URL ||
    exampleEnv.EXPO_PUBLIC_LIVE_STREAM_URL ||
    ''
  ).trim();
}

function printUsageAndExit() {
  console.error('Usage: node scripts/read-icy-metadata.js <stream-url>');
  console.error('Fallback: EXPO_PUBLIC_LIVE_STREAM_URL from .env.local or .env.example');
  process.exit(1);
}

const streamUrl = getStreamUrl();

if (!streamUrl) {
  printUsageAndExit();
}

const parsedUrl = new URL(streamUrl);
const client = parsedUrl.protocol === 'https:' ? https : http;
const request = client.get(
  {
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || undefined,
    path: `${parsedUrl.pathname}${parsedUrl.search}`,
    headers: {
      'Icy-MetaData': '1',
      'User-Agent': 'top-congo-stream-metadata-check',
      Accept: '*/*',
    },
  },
  response => {
    const metaint = Number(response.headers['icy-metaint'] ?? 0);
    const relevantHeaders = {
      'content-type': response.headers['content-type'],
      'icy-name': response.headers['icy-name'],
      'icy-description': response.headers['icy-description'],
      'icy-url': response.headers['icy-url'],
      'icy-br': response.headers['icy-br'],
      'icy-metaint': response.headers['icy-metaint'],
      server: response.headers.server,
    };

    console.log(`URL: ${streamUrl}`);
    console.log(`Status: ${response.statusCode}`);
    console.log('Headers:', JSON.stringify(relevantHeaders, null, 2));

    if (!Number.isFinite(metaint) || metaint <= 0) {
      console.log('Result: no ICY metadata interval exposed by the stream.');
      response.resume();
      return;
    }

    let buffer = Buffer.alloc(0);
    let audioBytesUntilMetadata = metaint;
    let metadataBlockHandled = false;

    response.on('data', chunk => {
      if (metadataBlockHandled) {
        return;
      }

      buffer = Buffer.concat([buffer, chunk]);

      while (!metadataBlockHandled) {
        if (audioBytesUntilMetadata > 0) {
          if (buffer.length < audioBytesUntilMetadata) {
            audioBytesUntilMetadata -= buffer.length;
            buffer = Buffer.alloc(0);
            return;
          }

          buffer = buffer.slice(audioBytesUntilMetadata);
          audioBytesUntilMetadata = 0;
        }

        if (buffer.length < 1) {
          return;
        }

        const metadataLength = buffer[0] * 16;
        if (buffer.length < 1 + metadataLength) {
          return;
        }

        const metadata = buffer
          .slice(1, 1 + metadataLength)
          .toString('utf8')
          .replace(/\0+$/g, '');

        console.log(`Metadata block length: ${metadataLength} bytes`);
        console.log(`Metadata raw: ${metadata || '(empty)'}`);

        const streamTitleMatch = metadata.match(/StreamTitle='([^']*)';?/i);
        const streamUrlMatch = metadata.match(/StreamUrl='([^']*)';?/i);

        console.log(
          'Parsed:',
          JSON.stringify(
            {
              streamTitle: streamTitleMatch ? streamTitleMatch[1] : null,
              streamUrl: streamUrlMatch ? streamUrlMatch[1] : null,
            },
            null,
            2
          )
        );

        metadataBlockHandled = true;
        response.destroy();
      }
    });

    response.on('close', () => {
      if (!metadataBlockHandled) {
        console.log('Result: stream exposes ICY metadata, but no full metadata block was captured before close.');
      }
    });
  }
);

request.setTimeout(15000, () => {
  request.destroy(new Error('Timed out while waiting for ICY metadata.'));
});

request.on('error', error => {
  console.error(`Failed: ${error.message}`);
  process.exit(1);
});
