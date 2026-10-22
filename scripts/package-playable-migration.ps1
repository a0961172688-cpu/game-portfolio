$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$exportRoot = Split-Path -Parent $repoRoot
$windowsPackages = @(
  @{ Id='dark-knight'; Source='B:\简历作品\黑暗骑士\源文件\新建文件夹'; Archive='黑暗骑士_Windows试玩.zip' },
  @{ Id='water-park'; Source='B:\简历作品\水上乐园\Game'; Archive='水上乐园_Windows试玩.zip' }
)
foreach ($package in $windowsPackages) {
  $destination = Join-Path $exportRoot $package.Archive
  if (!(Test-Path -LiteralPath $destination)) {
    Compress-Archive -Path (Join-Path $package.Source '*') -DestinationPath $destination -CompressionLevel Optimal
  }
}
$builds = @(
  @{ Id='jian-deng'; Source='B:\简历作品\缄灯：归渡\源文件\网站' },
  @{ Id='company-war'; Source='B:\简历作品\公司战争\网站' },
  @{ Id='sanxingdui'; Source='B:\简历作品\三星堆展馆\网站' },
  @{ Id='data-roam'; Source='B:\简历作品\数据漫游\网站' },
  @{ Id='water-park'; Source=(Join-Path $repoRoot 'public/play/water-park') },
  @{ Id='plane'; Source=(Join-Path $repoRoot 'public/play/plane') }
)
$objects = [System.Collections.Generic.List[object]]::new()
foreach ($build in $builds) {
  $rootPath = (Resolve-Path -LiteralPath $build.Source).Path.TrimEnd('\')
  Get-ChildItem -LiteralPath $rootPath -Recurse -File | ForEach-Object {
    $relative = $_.FullName.Substring($rootPath.Length+1).Replace('\','/')
    $objects.Add([PSCustomObject]@{ Key="play/$($build.Id)/$relative"; Source=$_.FullName; Bytes=$_.Length })
  }
}
foreach ($package in $windowsPackages) {
  $file = Get-Item -LiteralPath (Join-Path $exportRoot $package.Archive)
  $objects.Add([PSCustomObject]@{ Key="downloads/$($package.Id)-windows.zip"; Source=$file.FullName; Bytes=$file.Length })
}
$objects | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $repoRoot 'playable-migration-manifest.json') -Encoding utf8
$archivePath = Join-Path $exportRoot '木砚网站_试玩资源.zip'
if (!(Test-Path -LiteralPath $archivePath)) {
  $archive = [System.IO.Compression.ZipFile]::Open($archivePath, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    foreach ($item in $objects) {
      $compression = if ($item.Bytes -gt 20MB -or $item.Key -match '\.(gz|br|zip)$') { [System.IO.Compression.CompressionLevel]::NoCompression } else { [System.IO.Compression.CompressionLevel]::Fastest }
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $item.Source, $item.Key, $compression) | Out-Null
    }
  } finally { $archive.Dispose() }
}
[PSCustomObject]@{Archive=$archivePath;Objects=$objects.Count;Bytes=(Get-Item -LiteralPath $archivePath).Length;LargeObjects=@($objects | Where-Object {$_.Bytes -ge 25MB}).Count} | ConvertTo-Json
