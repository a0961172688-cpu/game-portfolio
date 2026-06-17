$ErrorActionPreference = "Continue"

$bucket = "game-portfolio-assets"
$repo = Split-Path -Parent $PSScriptRoot
$sourceRoot = "B:\简历作品"
$wrangler = Join-Path $repo "node_modules\.bin\wrangler.cmd"
$maxWranglerSize = 290MB

$items = @(
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
  param([string]$File, [string]$Key)
  $item = Get-Item -LiteralPath $File
  $sizeMb = [math]::Round($item.Length / 1MB, 2)
  if ($item.Length -gt $maxWranglerSize) {
    Write-Host "SKIP_TOO_LARGE $Key ($sizeMb MB)"
    return
  }

  Write-Host "UPLOAD $Key ($sizeMb MB)"
  $args = @(
    "r2", "object", "put", "$bucket/$Key",
    "--file", $File,
    "--remote",
    "--content-type", (Get-ContentType $File),
    "--cache-control", "public, max-age=31536000, immutable",
    "--force"
  )
  $encoding = Get-ContentEncoding $File
  if ($encoding) { $args += @("--content-encoding", $encoding) }
  & $wrangler @args
}

foreach ($entry in $items) {
  $buildRoot = Join-Path $sourceRoot $entry.Path
  if (!(Test-Path -LiteralPath $buildRoot)) {
    Write-Host "MISS $buildRoot"
    continue
  }

  Get-ChildItem -LiteralPath $buildRoot -Recurse -File | Sort-Object Length | ForEach-Object {
    $rootPrefix = $buildRoot.TrimEnd("\") + "\"
    $relative = $_.FullName.Substring($rootPrefix.Length).Replace("\", "/")
    Upload-Object -File $_.FullName -Key "$($entry.Key)/$relative"
  }
}
