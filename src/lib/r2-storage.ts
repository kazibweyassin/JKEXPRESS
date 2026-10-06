import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export function normalizeR2PublicUrl(publicUrl: string, bucket: string, accountId: string) {
  const trimmed = publicUrl.trim().replace(/\/$/, "");
  if (!trimmed) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const isR2ApiEndpoint = parsed.hostname === `${accountId}.r2.cloudflarestorage.com`;
    if (isR2ApiEndpoint) {
      return `https://${bucket}.${accountId}.r2.cloudflarestorage.com`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function configuration() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const rawPublicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !rawPublicUrl) {
    throw new Error("R2 storage is not configured. Add the five R2 variables shown in .env.example.");
  }
  const publicUrl = normalizeR2PublicUrl(rawPublicUrl, bucket, accountId);
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

function client(config: ReturnType<typeof configuration>) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function uploadR2File(
  key: string,
  body: Uint8Array,
  contentType: string,
  options?: { cacheControl?: string; contentDisposition?: string },
) {
  const config = configuration();
  await client(config).send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: options?.cacheControl ?? "public, max-age=31536000, immutable",
    ContentDisposition: options?.contentDisposition,
  }));
  return `${config.publicUrl}/${key}`;
}

export async function uploadR2Image(key: string, body: Uint8Array, contentType: string) {
  return uploadR2File(key, body, contentType);
}

export function r2KeyFromPublicUrl(url: string) {
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  if (!publicUrl || !bucket || !accountId) return null;

  const normalized = normalizeR2PublicUrl(publicUrl, bucket, accountId);
  if (!normalized || !url.startsWith(`${normalized}/`)) return null;
  return url.slice(normalized.length + 1);
}

export async function deleteR2Images(keys: string[]) {
  if (keys.length === 0) return;
  const config = configuration();
  await client(config).send(new DeleteObjectsCommand({
    Bucket: config.bucket,
    Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
  }));
}
