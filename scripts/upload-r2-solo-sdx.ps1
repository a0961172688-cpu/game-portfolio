$ErrorActionPreference = "Stop"

$bucket = "game-portfolio-assets"
$accountId = "da765a23052735008e80416b37c45f46"
$endpoint = "https://$accountId.r2.cloudflarestorage.com"
$file = "B:\简历作品\三星堆展馆\网站\Build\网站.data.gz"
$key = "play/sanxingdui/Build/网站.data.gz"
$aws = "aws"

if (Test-Path "C:\Program Files\Amazon\AWSCLIV2\aws.exe") {
  $aws = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
}

Write-Host "Cloudflare R2 single large-file uploader"
Write-Host "Target: $key"
Write-Host ""
Write-Host "Paste the same R2 API keys. They are used only in this window."
$env:AWS_ACCESS_KEY_ID = Read-Host "R2 Access Key ID"
$secret = Read-Host "R2 Secret Access Key" -AsSecureString
$env:AWS_SECRET_ACCESS_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
)
$env:AWS_DEFAULT_REGION = "auto"
$env:AWS_MAX_ATTEMPTS = "10"
$env:AWS_RETRY_MODE = "standard"

if (!(Test-Path -LiteralPath $file)) {
  throw "Missing local file: $file"
}

$size = [math]::Round((Get-Item -LiteralPath $file).Length / 1MB, 2)
Write-Host ""
Write-Host "Uploading $size MB. Keep this window open."

for ($attempt = 1; $attempt -le 3; $attempt++) {
  Write-Host ""
  Write-Host "Attempt $attempt / 3"
  & $aws s3 cp $file "s3://$bucket/$key" `
    --endpoint-url $endpoint `
    --content-type "application/octet-stream" `
    --content-encoding "gzip" `
    --cache-control "public, max-age=31536000, immutable" `
    --cli-connect-timeout 120 `
    --cli-read-timeout 0

  if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Upload completed: $key"
    exit 0
  }

  Write-Host "Attempt $attempt failed. Waiting 20 seconds before retry..."
  Start-Sleep -Seconds 20
}

throw "Upload failed after 3 attempts: $key"
