$ErrorActionPreference='Stop'
$repoRoot=Split-Path -Parent $PSScriptRoot
$exportRoot=Split-Path -Parent $repoRoot
function New-AssetArchive {
  param([string]$Output,[object[]]$Sources,[string]$Readme)
  if(Test-Path -LiteralPath $Output){throw "Release artifact already exists: $Output"}
  $zip=[IO.Compression.ZipFile]::Open($Output,[IO.Compression.ZipArchiveMode]::Create)
  try {
    foreach($source in $Sources){
      $resolved=(Resolve-Path -LiteralPath $source.Path).Path
      if((Get-Item -LiteralPath $resolved).PSIsContainer){
        Get-ChildItem -LiteralPath $resolved -File -Recurse | Where-Object {$_.FullName -notmatch 'DoNotShip|BackUpThisFolder|\.pdb$'} | ForEach-Object {
          $relative=$_.FullName.Substring($resolved.TrimEnd('\').Length+1).Replace('\','/')
          [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$_.FullName,"$($source.Prefix)$relative",[IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
      } else {
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$resolved,$source.Prefix,[IO.Compression.CompressionLevel]::Optimal) | Out-Null
      }
    }
    $readmeEntry=$zip.CreateEntry('试玩说明.txt')
    $writer=[IO.StreamWriter]::new($readmeEntry.Open(),[Text.UTF8Encoding]::new($false))
    try{$writer.Write($Readme)}finally{$writer.Dispose()}
  }finally{$zip.Dispose()}
}
New-AssetArchive -Output (Join-Path $exportRoot 'DeadFrame-Windows-V2.zip') -Sources @(@{Path='D:\My project (1)\Builds\DeadFrameV2';Prefix=''}) -Readme "断帧 / DEAD FRAME V2`r`nWindows 64位试玩原型。完整解压后运行 DeadFrame.exe，保留同目录的_Data、DLL、MonoBleedingEdge等依赖。`r`nEnter开始；A/D移动；空格跳跃；左键/J斩击；S/Ctrl翻滚；Shift慢动作；R重试；Esc暂停。`r`n这是受《武士零》机制启发的独立原型，并非完整原作复刻。`r`n"
New-AssetArchive -Output (Join-Path $exportRoot 'Ame-Night-Walk-Web.zip') -Sources @(
  @{Path=(Join-Path $repoRoot 'public/play/rain-night');Prefix='dist/'},
  @{Path='H:\unity\新项目1\scripts\serve.mjs';Prefix='scripts/serve.mjs'},
  @{Path='H:\unity\新项目1\scripts\launch.mjs';Prefix='scripts/launch.mjs'},
  @{Path='H:\unity\新项目1\启动项目.cmd';Prefix='启动项目.cmd'}
) -Readme "雨宿り · 雨夜漫步`r`n可以直接将dist目录部署到静态网站。在本机试玩需先安装Node.js，再双击启动项目.cmd。请勿直接双击HTML，浏览器模块需要HTTP服务。`r`nWASD移动；鼠标拖动画面；Shift跑步；E互动；F收伞/撑伞。也支持触屏操作。`r`n人物与动作的来源许可完整保留于dist/THIRD_PARTY.md及assets/animations/SOURCES.md。`r`n"
Get-Item -LiteralPath (Join-Path $exportRoot 'DeadFrame-Windows-V2.zip'),(Join-Path $exportRoot 'Ame-Night-Walk-Web.zip') | Select-Object Name,Length | ConvertTo-Json
