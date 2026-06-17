$ErrorActionPreference = "Stop"

$bucket = "game-portfolio-assets"
$accountId = "da765a23052735008e80416b37c45f46"
$endpoint = "https://$accountId.r2.cloudflarestorage.com"
$aws = "aws"

if (Test-Path "C:\Program Files\Amazon\AWSCLIV2\aws.exe") {
  $aws = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
}

$videos = @(
  @{ File = "B:\简历作品\缄灯：归渡\缄灯：归渡演示视频.mp4"; Key = "videos/jian-deng.mp4" },
  @{ File = "B:\简历作品\黑暗骑士\24032121230-李本研\黑暗骑士-游戏演示.mp4"; Key = "videos/dark-knight.mp4" },
  @{ File = "B:\简历作品\公司战争\演示视频.mp4"; Key = "videos/company-war.mp4" },
  @{ File = "B:\简历作品\三星堆展馆\三星堆1 2026.01.22 - 08.36.05.07.mp4"; Key = "videos/sanxingdui.mp4" },
  @{ File = "B:\简历作品\VR博物馆\演示视频.mp4"; Key = "videos/vr-museum.mp4" },
  @{ File = "B:\简历作品\水上乐园\水上乐园演示视频.mp4"; Key = "videos/water-park.mp4" },
  @{ File = "B:\简历作品\恐怖游戏\演示视频.mp4"; Key = "videos/horror.mp4" },
  @{ File = "B:\简历作品\数据漫游\演示视频.mp4"; Key = "videos/data-roam.mp4" },
  @{ File = "B:\简历作品\飞机大战\演示视频.mp4"; Key = "videos/plane.mp4" }
)

Write-Host "Cloudflare R2 video uploader"
Write-Host "Bucket: $bucket"
Write-Host "Endpoint: $endpoint"
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

foreach ($video in $videos) {
  if (!(Test-Path -LiteralPath $video.File)) {
    Write-Host "MISS $($video.File)"
    continue
  }

  $size = [math]::Round((Get-Item -LiteralPath $video.File).Length / 1MB, 2)
  Write-Host ""
  Write-Host "UPLOAD $($video.Key) ($size MB)"

  for ($attempt = 1; $attempt -le 3; $attempt++) {
    Write-Host "Attempt $attempt / 3"
    & $aws s3 cp $video.File "s3://$bucket/$($video.Key)" `
      --endpoint-url $endpoint `
      --content-type "video/mp4" `
      --cache-control "public, max-age=31536000, immutable" `
      --cli-connect-timeout 120 `
      --cli-read-timeout 0

    if ($LASTEXITCODE -eq 0) {
      Write-Host "Upload completed: $($video.Key)"
      break
    }

    if ($attempt -eq 3) {
      throw "Upload failed after 3 attempts: $($video.Key)"
    }

    Write-Host "Attempt $attempt failed. Waiting 20 seconds before retry..."
    Start-Sleep -Seconds 20
  }
}

Write-Host ""
Write-Host "All video uploads completed."
