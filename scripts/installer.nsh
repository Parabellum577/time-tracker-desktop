!macro customUnInit
  WriteRegExpandStr HKCR "timeguarddev" "isUninstall" "true"
  DeleteRegKey HKCR "timeguarddev"
  WriteRegExpandStr HKCR "timeguard" "isUninstall" "true"
  DeleteRegKey HKCR "timeguard"
!macroend
