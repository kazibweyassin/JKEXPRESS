import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function configuration() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicUrl = process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error("R2 storage is not configured. Add the five R2 variables shown in .env.example.");
  }
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

export async function uploadR2Image(key: string, body: Uint8Array, contentType: string) {
  const config = configuration();
  await client(config).send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${config.publicUrl}/${key}`;
}

export async function deleteR2Images(keys: string[]) {
  if (keys.length === 0) return;
  const config = configuration();
  await client(config).send(new DeleteObjectsCommand({
    Bucket: config.bucket,
    Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
  }));
}
