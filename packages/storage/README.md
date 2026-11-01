# Object storage

This package uses the S3 API and supports AWS S3, Cloudflare R2, MinIO, and
other compatible providers. Configure the bucket and region with environment
variables. Set `STORAGE_ENDPOINT` and the access-key pair for providers with
custom endpoints. For AWS, omit the endpoint and use the standard AWS
credential chain (or provide the access-key pair).

Buckets should remain private. Uploads and reads use short-lived presigned
URLs; authorize the user and listing on the server before issuing either URL.
Verify uploaded object metadata before saving its key in `listing_media`.
Never store presigned URLs in the database; generate them when needed.
For browser uploads, configure bucket CORS to allow `PUT` from the web
application origin and the `Content-Type` request header.

The package allows JPEG, PNG, WebP, AVIF, HEIC, PDF, MP4, and QuickTime
uploads with size limits (20 MiB for images, 25 MiB for PDFs, and 250 MiB for
videos). SVG is intentionally excluded. Uploads whose stored type or size
doesn't match the request are deleted during post-upload verification. A
presigned S3 `PUT` cannot enforce a maximum body size before upload, so the
application must limit presign requests, rate-limit them, and verify uploads
before recording media. The application should also validate file signatures
and run malware scanning where required.
