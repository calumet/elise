import { createServer } from "@calumet/suamox-hono-adapter";

const port = Number(process.env.PORT) || 5174;

await createServer({ port });
