$isTestnet = $false
 
Write-Host "Started creation of Windows packages"

(Get-Content ..\Gruntfile.js).replace('0.14.7', '0.24.3') | Set-Content ..\Gruntfile.js
Write-Host "Chanaged nwjs version"

cd ..\
$currentProjectDirectory = (Get-Item -Path ".\" -Verbose).FullName
Remove-Item .\node_modules -Force -Recurse

bower install
Write-Host "Bower install completed"

npm install
Write-Host "Npm install completed"

grunt
Write-Host "Grunt completed"

Remove-Item ..\net.bg.simpa.androidbuilds -Force -Recurse
Write-Host "Removed old net.bg.simpa.androidbuilds"

Copy-Item -Path "$($currentProjectDirectory)\devbuilds\sqlite3\*" -Destination "$($currentProjectDirectory)\node_modules\sqlite3\lib\binding" -recurse -Force
Write-Host "Copied sqlite3 lib bindings"

if ($isTestnet) {
  (Get-Content "$($currentProjectDirectory)\node_modules\net.bg.simpa.androidcore\constants.js").replace("exports.version = '1.0';", "exports.version = '1.0t';") | Set-Content "$($currentProjectDirectory)\node_modules\net.bg.simpa.androidcore\constants.js"
  Write-Host "testnetified net.bg.simpa.androidcore constants"
  
  grunt desktop:testnet
  Write-Host "Grunt desktop completed"
  
  Write-Host "Started copying node_modules"
  Copy-Item -Path "$($currentProjectDirectory)\node_modules" -Destination ..\net.bg.simpa.androidbuilds\DagWallet-tn\win32\ -recurse -Force
  Copy-Item -Path "$($currentProjectDirectory)\node_modules" -Destination ..\net.bg.simpa.androidbuilds\DagWallet-tn\win64\ -recurse -Force
  Write-Host "Copied node_modules"
  
  Write-Host "Started grunt inno task"
  grunt inno64:testnet
  grunt inno32:testnet
  Write-Host "Completed grunt inno task"
} else {
  grunt desktop:live
  Write-Host "Grunt desktop completed"
  
  Write-Host "Started copying node_modules"
  Copy-Item -Path "$($currentProjectDirectory)\node_modules" -Destination ..\net.bg.simpa.androidbuilds\DagWallet\win32\ -recurse -Force
  Copy-Item -Path "$($currentProjectDirectory)\node_modules" -Destination ..\net.bg.simpa.androidbuilds\DagWallet\win64\ -recurse -Force
  Write-Host "Copied node_modules"
  
  Write-Host "Started grunt inno task"
  grunt inno64:live
  grunt inno32:live
  Write-Host "Completed grunt inno task"
}
