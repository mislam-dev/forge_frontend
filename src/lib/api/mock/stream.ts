export const MOCK_BUILD_LOG_LINES = [
  '\x1b[36m[Forge Builder]\x1b[0m Initializing isolated build runner v2.4.1 (container: sandbox-x86_64)',
  '\x1b[34m[Git]\x1b[0m Fetching commit metadata from origin...',
  '\x1b[34m[Git]\x1b[0m Cloned commit \x1b[33ma89c2b4\x1b[0m on branch \x1b[32mmain\x1b[0m by Monirul Islam',
  '\x1b[35m[Runtime]\x1b[0m Detected runtime environment: Rust 1.81.0 (stable-x86_64-unknown-linux-gnu)',
  '\x1b[34m[Cache]\x1b[0m Restoring cargo target cache from registry.forge.internal/cache (312 MB restored)',
  '\x1b[32m[Cargo]\x1b[0m Updating crates.io index',
  '\x1b[32m[Cargo]\x1b[0m Compiling proc-macro2 v1.0.86',
  '\x1b[32m[Cargo]\x1b[0m Compiling unicode-ident v1.0.12',
  '\x1b[32m[Cargo]\x1b[0m Compiling syn v2.0.72',
  '\x1b[32m[Cargo]\x1b[0m Compiling serde v1.0.204',
  '\x1b[32m[Cargo]\x1b[0m Compiling tokio v1.38.0',
  '\x1b[32m[Cargo]\x1b[0m Compiling axum v0.7.5',
  '\x1b[32m[Cargo]\x1b[0m Compiling tower-http v0.5.2',
  '\x1b[32m[Cargo]\x1b[0m Compiling forge-core v0.1.0 (/build/forge-core)',
  '\x1b[32m[Cargo]\x1b[0m Compiling forge-api-gateway v0.1.0 (/build/forge-api-gateway)',
  '\x1b[32m[Cargo]\x1b[0m Finished `release` profile [optimized + debuginfo] target(s) in 24.32s',
  '\x1b[36m[Docker]\x1b[0m Creating container image with gcr.io/distroless/cc-debian12',
  '\x1b[36m[Docker]\x1b[0m Stripping binary symbols and compressing layers',
  '\x1b[36m[Docker]\x1b[0m Image built successfully: sha256:7f920da821 (size: 42.4MB)',
  '\x1b[34m[Deploy]\x1b[0m Dispatching image to Kubernetes cluster edge-node-03',
  '\x1b[34m[Deploy]\x1b[0m Provisioning pod replica 1/1 with env variables injected',
  '\x1b[32m[HealthCheck]\x1b[0m Probing HTTP GET /api/v1/health -> 200 OK (latency: 4ms)',
  '\x1b[32m[Traffic]\x1b[0m Ingress route updated: 100% traffic shifted to active replica',
  '\x1b[1;32m[SUCCESS]\x1b[0m Deployment completed successfully in 48.2s.',
];

export function simulateBuildStream(onLine: (line: string) => void): () => void {
  let index = 0;
  let timer: NodeJS.Timeout | null = null;

  const pushNext = () => {
    if (index < MOCK_BUILD_LOG_LINES.length) {
      onLine(MOCK_BUILD_LOG_LINES[index]);
      index += 1;
      const delay = Math.floor(Math.random() * 600) + 300;
      timer = setTimeout(pushNext, delay);
    }
  };

  timer = setTimeout(pushNext, 200);

  return () => {
    if (timer) clearTimeout(timer);
  };
}
