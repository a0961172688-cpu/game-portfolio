$ErrorActionPreference = "Stop"

$bucket = "game-portfolio-assets"
$repo = Split-Path -Parent $PSScriptRoot
$sourceRoot = "B:\简历作品"
$wrangler = Join-Path $repo "node_modules\.bin\wrangler.cmd"

$videos = @(
  @{ Key = "videos/jian-deng.mp4"; Path = "缄灯：归渡\演示视频.mp4" },
  @{ Key = "videos/dark-knight.mp4"; Path = "黑暗骑士\24032121230-李本研\24032121230-李本研-游戏演示.mp4" },
  @{ Key = "videos/company-war.mp4"; Path = "公司战争\演示视频.mp4" },
  @{ Key = "videos/sanxingdui.mp4"; Path = "三星堆展馆\三星堆1 2026.01.22 - 08.36.05.07.mp4" },
  @{ Key = "videos/vr-museum.mp4"; Path = "VR博物馆\演示视频.mp4" },
  @{ Key = "videos/water-park.mp4"; Path = "水上乐园\演示视频.mp4" },
  @{ Key = "videos/horror.mp4"; Path = "恐怖游戏\演示视频.mp4" },
  @{ Key = "videos/data-roam.mp4"; Path = "数据漫游\演示视频.mp4" },
  @{ Key = "videos/plane.mp4"; Path = "飞机大战\演示视频.mp4" }
)

$webglBuilds = @(
  @{ Key = "play/jian-deng"; Path = "缄灯：归渡\源文件\网站" },
  @{ Key = "play/company-war"; Path = "公司战争\网站" },
  @{ Key = "play/sanxingdui"; Path = "三星堆展馆\网站" },
  @{ Key = "play/data-roam"; Path = "数据漫游\网站" },
  @{ Key = "play/water-park"; Path = "水上乐园\WebGL Builds" },
  @{ Key = "play/plane"; Path = "飞机大战\网页" }
)

function Get-ContentType {
  param([string]$Path)

  $name = [IO.Path]::GetFileName($Path).ToLowerInvariant()
  $extension = [IO.Path]::GetExtension($Path).ToLowerInvariant()

  if ($name.EndsWith(".wasm.gz") -or $name.EndsWith(".wasm.br") -or $extension -eq ".wasm") { return "application/wasm" }
  if ($name.EndsWith(".js.gz") -or $name.EndsWith(".js.br") -or $extension -eq ".js") { return "application/javascript" }

  switch ($extension) {
    ".html" { "text/html; charset=utf-8"; break }
    ".css" { "text/css; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".mp4" { "video/mp4"; break }
    ".mp3" { "audio/mpeg"; break }
    ".wav" { "audio/wav"; break }
    ".png" { "image/png"; break }
    ".jpg" { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".ico" { "image/x-icon"; break }
    default { "application/octet-stream"; break }
  }
}

function Get-ContentEncoding {
  param([string]$Path)

  $name = [IO.Path]::GetFileName($Path).ToLowerInvariant()
  if ($name.EndsWith(".gz")) { return "gzip" }
  if ($name.EndsWith(".br")) { return "br" }
  return $null
}

function Upload-Object {
  param(
    [string]$File,
    [string]$Key
  )

  if (!(Test-Path -LiteralPath $File)) {
    Write-Host "MISS $File"
    return
  }

  $ct = Get-ContentType $File
  $ce = Get-ContentEncoding $File
  $sizeMb = [math]::Round((Get-Item -LiteralPath $File).Length / 1MB, 2)
  Write-Host "UPLOAD $Key ($sizeMb MB)"

  $args = @(
    "r2", "object", "put", "$bucket/$Key",
    "--file", $File,
    "--remote",
    "--content-type", $ct,
    "--cache-control", "public, max-age=31536000, immutable",
    "--force"
  )

  if ($ce) {
    $args += @("--content-encoding", $ce)
  }

  & $wrangler @args
}

foreach ($build in $webglBuilds) {
  $buildRoot = Join-Path $sourceRoot $build.Path
  if (!(Test-Path -LiteralPath $buildRoot)) {
    Write-Host "MISS $buildRoot"
    continue
  }

  Get-ChildItem -LiteralPath $buildRoot -Recurse -File | ForEach-Object {
    $rootPrefix = $buildRoot.TrimEnd("\") + "\"
    $relative = $_.FullName.Substring($rootPrefix.Length).Replace("\", "/")
    Upload-Object -File $_.FullName -Key "$($build.Key)/$relative"
  }
}

foreach ($video in $videos) {
  Upload-Object -File (Join-Path $sourceRoot $video.Path) -Key ($video.Path.Replace("\", "/"))
}
