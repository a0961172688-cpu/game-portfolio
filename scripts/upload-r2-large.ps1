$ErrorActionPreference = "Stop"

$bucket = "game-portfolio-assets"
$accountId = "da765a23052735008e80416b37c45f46"
$endpoint = "https://$accountId.r2.cloudflarestorage.com"

$largeObjects = @(
  @{
    File = "B:\简历作品\三星堆展馆\网站\Build\网站.data.gz"
    Key = "play/sanxingdui/Build/网站.data.gz"
    ContentType = "application/octet-stream"
    ContentEncoding = "gzip"
  },
  @{
    File = "B:\简历作品\数据漫游\网站\Build\网站.data.gz"
    Key = "play/data-roam/Build/网站.data.gz"
    ContentType = "application/octet-stream"
    ContentEncoding = "gzip"
  },
  @{
    File = "B:\简历作品\黑暗骑士\24032121230-李本研\24032121230-李本研-游戏演示.mp4"
    Key = "黑暗骑士/24032121230-李本研/24032121230-李本研-游戏演示.mp4"
    ContentType = "video/mp4"
  },
  @{
    File = "B:\简历作品\缄灯：归渡\演示视频.mp4"
    Key = "缄灯：归渡/演示视频.mp4"
    ContentType = "video/mp4"
  },
  @{
    File = "B:\简历作品\恐怖游戏\演示视频.mp4"
    Key = "恐怖游戏/演示视频.mp4"
    ContentType = "video/mp4"
  },
  @{
    File = "B:\简历作品\三星堆展馆\三星堆1 2026.01.22 - 08.36.05.07.mp4"
    Key = "三星堆展馆/三星堆1 2026.01.22 - 08.36.05.07.mp4"
    ContentType = "video/mp4"
  }
)

$aws = "aws"
if (Test-Path "C:\Program Files\Amazon\AWSCLIV2\aws.exe") {
  $aws = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
}

Write-Host "Cloudflare R2 multipart uploader"
Write-Host "Bucket: $bucket"
Write-Host "Endpoint: $endpoint"
Write-Host ""
Write-Host "Paste your R2 Access Key ID and Secret Access Key here. They are used only in this process."
$env:AWS_ACCESS_KEY_ID = Read-Host "R2 Access Key ID"
$secret = Read-Host "R2 Secret Access Key" -AsSecureString
$env:AWS_SECRET_ACCESS_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
)
$env:AWS_DEFAULT_REGION = "auto"

foreach ($object in $largeObjects) {
  if (!(Test-Path -LiteralPath $object.File)) {
    Write-Host "MISS $($object.File)"
    continue
  }

  $size = [math]::Round((Get-Item -LiteralPath $object.File).Length / 1MB, 2)
  Write-Host ""
  Write-Host "UPLOAD $($object.Key) ($size MB)"

  $args = @(
    "s3", "cp", $object.File, "s3://$bucket/$($object.Key)",
    "--endpoint-url", $endpoint,
    "--content-type", $object.ContentType,
    "--cache-control", "public, max-age=31536000, immutable",
    "--only-show-errors"
  )

  if ($object.ContentEncoding) {
    $args += @("--content-encoding", $object.ContentEncoding)
  }

  & $aws @args
  if ($LASTEXITCODE -ne 0) {
    throw "Upload failed: $($object.Key)"
  }
}

Write-Host ""
Write-Host "Large R2 uploads completed."
