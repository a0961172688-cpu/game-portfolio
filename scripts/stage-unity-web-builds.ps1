$ErrorActionPreference='Stop'
$repoRoot=Split-Path -Parent $PSScriptRoot
$buildRoot='D:\PortfolioWebBuilds'
$items=@(
  @{Id='pandaku';Source='D:\PandakuGroupAndroid20261020';Stage='Pandaku'},
  @{Id='dead-frame';Source='D:\My project (1)';Stage='DeadFrame'}
)
foreach($item in $items){
  $stagePath=Join-Path $buildRoot $item.Stage
  if(Test-Path -LiteralPath $stagePath){throw "Build stage already exists; inspect it before reuse: $stagePath"}
  New-Item -ItemType Directory -Path $stagePath | Out-Null
  foreach($folder in @('Assets','Packages','ProjectSettings')){
    Copy-Item -LiteralPath (Join-Path $item.Source $folder) -Destination (Join-Path $stagePath $folder) -Recurse
  }
  $editorFolder=Join-Path $stagePath 'Assets/Editor'
  New-Item -ItemType Directory -Path $editorFolder -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'UnityPortfolioWebBuild.cs') -Destination (Join-Path $editorFolder 'UnityPortfolioWebBuild.cs')
  [PSCustomObject]@{Id=$item.Id;Stage=$stagePath;Output=(Join-Path $repoRoot ".game-builds/$($item.Id)")} | ConvertTo-Json -Compress
}
