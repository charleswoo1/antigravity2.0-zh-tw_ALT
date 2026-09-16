#define AppVersion "1.1.0"
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
  #define ArtifactName "Antigravity-ZH-Hant-TW-ALT-1.1.0-Windows-Restore"
  #define DisplayName "Antigravity 2.0 繁體中文 ALT 版 — 還原"
  #define EngineArguments "--restore"
#else
  #define ArtifactName "Antigravity-ZH-Hant-TW-ALT-1.1.0-Windows"
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
Source: "{#SourceRoot}\*"; DestDir: "{tmp}\Antigravity-ZH-Hant-TW-ALT"; Flags: recursesubdirs createallsubdirs ignoreversion dontcopy noencryption

[Code]
var
  SetupExitCode: Integer;
  PayloadExtracted: Boolean;
  TestModeActive: Boolean;

function IsSafeTestLogDir(const Candidate: String): Boolean;
var
  TempParent: String;
  NormalizedCandidate: String;
begin
  TempParent := AddBackslash(Lowercase(ExtractFileDir(ExpandConstant('{tmp}'))));
  NormalizedCandidate := AddBackslash(Lowercase(ExpandFileName(Candidate)));
  Result := (Pos(TempParent, NormalizedCandidate) = 1) and
    (Pos('antigravity-alt-installer-', NormalizedCandidate) > 0);
end;

function ResolveLogDir(): String;
var
  TestLogDir: String;
begin
  TestLogDir := ExpandConstant('{param:TestLogDir|}');
  if TestLogDir = '' then begin
    TestModeActive := False;
    Result := ExpandConstant('{localappdata}\Antigravity-ZH-Hant-TW-ALT');
    exit;
  end;
  if not IsSafeTestLogDir(TestLogDir) then
    RaiseException('TestLogDir 必須位於系統暫存目錄，且路徑必須包含 antigravity-alt-installer-。');
  TestModeActive := True;
  Result := ExpandFileName(TestLogDir);
end;

function ProcessSafetyBypassAllowed(): Boolean;
begin
  Result := TestModeActive and (ExpandConstant('{param:SkipProcessClose|0}') = '1');
end;

function LoadUTF8Summary(const FileName: String; const Fallback: String): String;
var
  SummaryLines: TArrayOfString;
  I: Integer;
begin
  Result := Fallback;
  if not LoadStringsFromFile(FileName, SummaryLines) then
    exit;
  Result := '';
  for I := 0 to GetArrayLength(SummaryLines) - 1 do begin
    if I > 0 then
      Result := Result + #13#10;
    Result := Result + SummaryLines[I];
  end;
  if TestModeActive then
    SaveStringsToUTF8File(FileName + '.decoded.txt', SummaryLines, False);
end;

procedure FailSetup(const MessageText: String; const ExitCode: Integer);
begin
  SetupExitCode := ExitCode;
  if WizardSilent then
    Abort
  else
    RaiseException(MessageText);
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: Integer;
  NodePath: String;
  AuditorPath: String;
  LogDir: String;
  LogPath: String;
  SummaryPath: String;
  JsonPath: String;
  AntigravityDir: String;
  ExtraArguments: String;
  CommandLine: String;
  SummaryText: String;
begin
  Result := '';
  if not PayloadExtracted then begin
    ExtractTemporaryFiles('*');
    PayloadExtracted := True;
  end;

  { ResolveLogDir validates and activates the isolated test mode. A caller may
    never enable the process-safety bypass without that validated mode. }
  LogDir := ResolveLogDir();
  if (ExpandConstant('{param:SkipProcessClose|0}') = '1') and (not TestModeActive) then begin
    SetupExitCode := 1;
    Result := 'SkipProcessClose 僅供隔離的 installer regression tests 使用；正式安裝不得略過程序安全檢查。';
    exit;
  end;

#if Mode == "Install"
  NodePath := ExpandConstant('{tmp}\Antigravity-ZH-Hant-TW-ALT\runtime\node.exe');
  AuditorPath := ExpandConstant('{tmp}\Antigravity-ZH-Hant-TW-ALT\tools\compatibility-audit.js');
  LogDir := ResolveLogDir();
  ForceDirectories(LogDir);
  LogPath := LogDir + '\last-Preflight.log';
  SummaryPath := LogDir + '\last-Preflight.summary.txt';
  JsonPath := LogDir + '\last-Preflight.json';
  DeleteFile(SummaryPath);
  DeleteFile(JsonPath);

  ExtraArguments := '';
  AntigravityDir := ExpandConstant('{param:AntigravityDir|}');
  if AntigravityDir <> '' then
    ExtraArguments := ' --install-dir "' + AntigravityDir + '"';
  if not ProcessSafetyBypassAllowed() then
    ExtraArguments := ExtraArguments + ' --require-not-running';

  CommandLine := '/D /S /C ""' + NodePath + '" "' + AuditorPath + '"' + ExtraArguments +
    ' --require-verified --json "' + JsonPath + '" --error-summary "' + SummaryPath +
    '" > "' + LogPath + '" 2>&1"';
  if not Exec(ExpandConstant('{cmd}'), CommandLine, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then begin
    SetupExitCode := 1;
    Result := '無法啟動 ALT 相容性 preflight。' + #13#10 + '詳細記錄：' + LogPath;
    exit;
  end;
  if ResultCode <> 0 then begin
    SetupExitCode := ResultCode;
    SummaryText := LoadUTF8Summary(
      SummaryPath,
      '原因：ALT 相容性 preflight 失敗。' + #13#10 + 'Antigravity 未被修改。'
    );
    Result := SummaryText + #13#10 + '詳細記錄：' + LogPath;
  end;
#endif
end;

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
  SummaryPath: String;
  SummaryText: String;
  CommandLine: String;
  AntigravityDir: String;
  ExtraArguments: String;
begin
  if CurStep <> ssPostInstall then
    exit;

  if not PayloadExtracted then begin
    ExtractTemporaryFiles('*');
    PayloadExtracted := True;
  end;

  NodePath := ExpandConstant('{tmp}\Antigravity-ZH-Hant-TW-ALT\runtime\node.exe');
  EnginePath := ExpandConstant('{tmp}\Antigravity-ZH-Hant-TW-ALT\localization_engine.js');
  LogDir := ResolveLogDir();
  ForceDirectories(LogDir);
  LogPath := LogDir + '\last-{#Mode}.log';
  SummaryPath := LogDir + '\last-{#Mode}.summary.txt';
  DeleteFile(SummaryPath);

  ExtraArguments := '';
  AntigravityDir := ExpandConstant('{param:AntigravityDir|}');
  if AntigravityDir <> '' then
    ExtraArguments := ' --install-dir "' + AntigravityDir + '"';
  if ProcessSafetyBypassAllowed() then
    ExtraArguments := ExtraArguments + ' --skip-process-close';

  ExtraArguments := ExtraArguments + ' --error-summary "' + SummaryPath + '"';
  CommandLine := '/D /S /C ""' + NodePath + '" "' + EnginePath + '" {#EngineArguments}' + ExtraArguments + ' > "' + LogPath + '" 2>&1"';
  if not Exec(ExpandConstant('{cmd}'), CommandLine, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then begin
    FailSetup('無法啟動內建的 ALT 執行環境。記錄：' + LogPath, 1);
    exit;
  end;

  if ResultCode <> 0 then begin
    SummaryText := LoadUTF8Summary(
      SummaryPath,
      '原因：中文化引擎執行失敗，請查看完整記錄。' + #13#10 + 'Antigravity 未被修改。'
    );
    FailSetup('ALT {#Mode} 失敗。' + #13#10 + #13#10 + SummaryText + #13#10 + '詳細記錄：' + LogPath, ResultCode);
    exit;
  end;

  if not WizardSilent then
    MsgBox('{#DisplayName} 已完成。' + #13#10 + '執行記錄：' + LogPath, mbInformation, MB_OK);
end;
