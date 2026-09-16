#define AppVersion "1.0.0"
#ifndef SourceRoot
  #define SourceRoot "..\..\.build\windows-x64\payload"
#endif
#ifndef OutputDir
  #define OutputDir "..\..\dist"
#endif
#ifndef Mode
  #define Mode "Install"
#endif
#ifndef TargetArch
  #define TargetArch "x64compatible"
#endif

#if Mode == "Restore"
  #define ArtifactName "Antigravity-ZH-Hant-TW-ALT-1.0.0-Windows-Restore"
  #define DisplayName "Antigravity 2.0 繁體中文 ALT 版 — 還原"
  #define EngineArguments "--restore"
#else
  #define ArtifactName "Antigravity-ZH-Hant-TW-ALT-1.0.0-Windows"
  #define DisplayName "Antigravity 2.0 繁體中文 ALT 版"
  #define EngineArguments ""
#endif

[Setup]
AppId={{D9E56802-AE4A-4F2B-BB92-8F42F6A6B5AA}-{#Mode}
AppName={#DisplayName}
AppVersion={#AppVersion}
AppPublisher=Antigravity Traditional Chinese ALT
DefaultDirName={tmp}\Antigravity-ZH-Hant-TW-ALT
DisableProgramGroupPage=yes
DisableReadyPage=no
DisableFinishedPage=no
CreateAppDir=no
Uninstallable=no
PrivilegesRequired=lowest
ArchitecturesAllowed={#TargetArch}
OutputDir={#OutputDir}
OutputBaseFilename={#ArtifactName}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
SetupLogging=yes

[Files]
Source: "{#SourceRoot}\*"; DestDir: "{tmp}\Antigravity-ZH-Hant-TW-ALT"; Flags: recursesubdirs createallsubdirs ignoreversion

[Code]
var
  SetupExitCode: Integer;

function GetCustomSetupExitCode(): Integer;
begin
  Result := SetupExitCode;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
  NodePath: String;
  EnginePath: String;
  LogDir: String;
  LogPath: String;
  CommandLine: String;
  AntigravityDir: String;
  ExtraArguments: String;
begin
  if CurStep <> ssPostInstall then
    exit;

  NodePath := ExpandConstant('{tmp}\Antigravity-ZH-Hant-TW-ALT\runtime\node.exe');
  EnginePath := ExpandConstant('{tmp}\Antigravity-ZH-Hant-TW-ALT\localization_engine.js');
  LogDir := ExpandConstant('{localappdata}\Antigravity-ZH-Hant-TW-ALT');
  ForceDirectories(LogDir);
  LogPath := LogDir + '\last-{#Mode}.log';

  ExtraArguments := '';
  AntigravityDir := ExpandConstant('{param:AntigravityDir|}');
  if AntigravityDir <> '' then
    ExtraArguments := ' --install-dir "' + AntigravityDir + '"';
  if ExpandConstant('{param:SkipProcessClose|0}') = '1' then
    ExtraArguments := ExtraArguments + ' --skip-process-close';

  CommandLine := '/D /S /C ""' + NodePath + '" "' + EnginePath + '" {#EngineArguments}' + ExtraArguments + ' > "' + LogPath + '" 2>&1"';
  if not Exec(ExpandConstant('{cmd}'), CommandLine, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then begin
    SetupExitCode := 1;
    RaiseException('無法啟動內建的 ALT 執行環境。記錄：' + LogPath);
  end;

  if ResultCode <> 0 then begin
    SetupExitCode := ResultCode;
    RaiseException('ALT {#Mode} 失敗（exit code ' + IntToStr(ResultCode) + '）。請查看：' + LogPath);
  end;

  if not WizardSilent then
    MsgBox('{#DisplayName} 已完成。' + #13#10 + '執行記錄：' + LogPath, mbInformation, MB_OK);
end;
