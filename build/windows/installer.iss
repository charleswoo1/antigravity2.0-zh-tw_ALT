#define AppVersion "1.1.1"
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
  #define ArtifactName "Antigravity-ZH-Hant-TW-ALT-1.1.1-Windows-Restore"
  #define DisplayName "Antigravity 2.0 繁體中文 ALT 版 — 還原"
  #define EngineArguments "--restore"
#else
  #define ArtifactName "Antigravity-ZH-Hant-TW-ALT-1.1.1-Windows"
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
  EngineSucceeded: Boolean;
  InstallOperationSucceeded: Boolean;
  GpuNoticeShown: Boolean;
  ResolvedAntigravityDir: String;
  GpuNoticeForm: TSetupForm;
  GpuNoticeStatusLabel: TNewStaticText;

procedure SetInstallerPhase(const Percent: Integer; const StatusText: String);
begin
  if WizardSilent then
    exit;
  WizardForm.ProgressGauge.Max := 100;
  WizardForm.ProgressGauge.Position := Percent;
  WizardForm.StatusLabel.Caption := StatusText;
  WizardForm.StatusLabel.Update;
  WizardForm.ProgressGauge.Update;
  WizardForm.Update;
end;

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

function LoadFirstUTF8Line(const FileName: String): String;
var
  Lines: TArrayOfString;
begin
  Result := '';
  if LoadStringsFromFile(FileName, Lines) and (GetArrayLength(Lines) > 0) then
    Result := Trim(Lines[0]);
end;

function IsAffectedWindowsGpuBuildNumber(const Build: Cardinal): Boolean;
begin
  Result := Build = 26200;
end;

function IsAffectedWindowsGpuBuild(): Boolean;
var
  Version: TWindowsVersion;
begin
  GetWindowsVersionEx(Version);
  Result := IsAffectedWindowsGpuBuildNumber(Version.Build);
end;

function SafeModeShortcutPath(): String;
begin
  Result := ExpandConstant('{userdesktop}\Antigravity 安全模式（停用 GPU）.lnk');
end;

function OfficialAntigravityExecutable(): String;
begin
  if ResolvedAntigravityDir = '' then begin
    Result := '';
    exit;
  end;
  Result := AddBackslash(ResolvedAntigravityDir) + 'Antigravity.exe';
end;

procedure SetGpuNoticeStatus(const StatusText: String);
begin
  if GpuNoticeStatusLabel <> nil then begin
    GpuNoticeStatusLabel.Caption := StatusText;
    GpuNoticeStatusLabel.Update;
  end;
end;

procedure CopyDisableGpuArgument(Sender: TObject);
var
  ResultCode: Integer;
begin
  if Exec(
    ExpandConstant('{cmd}'),
    '/D /S /C "<nul set /p=--disable-gpu|clip.exe"',
    '',
    SW_HIDE,
    ewWaitUntilTerminated,
    ResultCode
  ) and (ResultCode = 0) then
    SetGpuNoticeStatus('已複製 --disable-gpu')
  else
    SetGpuNoticeStatus('無法複製 --disable-gpu，請手動複製此參數。');
end;

procedure CreateGpuSafeModeShortcut(Sender: TObject);
var
  ExePath: String;
begin
  ExePath := OfficialAntigravityExecutable();
  if (ExePath = '') or (not FileExists(ExePath)) then begin
    SetGpuNoticeStatus('無法建立捷徑：找不到已驗證的官方 Antigravity.exe。');
    exit;
  end;

  try
    CreateShellLink(
      SafeModeShortcutPath(),
      'Antigravity 安全模式（停用 GPU）',
      ExePath,
      '--disable-gpu',
      ExtractFileDir(ExePath),
      ExePath,
      0,
      SW_SHOWNORMAL
    );
    SetGpuNoticeStatus('已建立桌面捷徑：Antigravity 安全模式（停用 GPU）');
  except
    SetGpuNoticeStatus('建立捷徑失敗：' + GetExceptionMessage());
  end;
end;

procedure ShowGpuKnownIssueNotice();
var
  MessageLabel: TNewStaticText;
  CopyButton: TNewButton;
  ShortcutButton: TNewButton;
  DoneButton: TNewButton;
  NextTop: Integer;
begin
  { Compact fixed-size advisory for high-DPI systems. }
  GpuNoticeForm := CreateCustomForm(ScaleX(360), ScaleY(232), True, True);
  try
    GpuNoticeForm.Caption := 'Windows 11 25H2 相容性提醒';
    GpuNoticeForm.Position := poScreenCenter;

    MessageLabel := TNewStaticText.Create(GpuNoticeForm);
    MessageLabel.Parent := GpuNoticeForm;
    MessageLabel.SetBounds(ScaleX(16), ScaleY(12), ScaleX(328), ScaleY(1));
    MessageLabel.AutoSize := False;
    MessageLabel.WordWrap := True;
    MessageLabel.Caption :=
      '部分 Windows 11 25H2（Build 26200.x）系統可能在關閉 Antigravity 後無法再次啟動。' + #13#10 +
      '此問題也能在官方英文版重現，較可能與 Antigravity / Electron 的 GPU 啟動路徑相容性有關。' + #13#10 +
      '若反覆發生，可重新啟動 Windows，或使用 --disable-gpu／下方安全模式捷徑。安全模式只停用 GPU 加速，不會修改正常捷徑。';
    MessageLabel.AdjustHeight();
    NextTop := MessageLabel.Top + MessageLabel.Height + ScaleY(6);

    GpuNoticeStatusLabel := TNewStaticText.Create(GpuNoticeForm);
    GpuNoticeStatusLabel.Parent := GpuNoticeForm;
    GpuNoticeStatusLabel.SetBounds(ScaleX(16), NextTop, ScaleX(328), ScaleY(18));
    GpuNoticeStatusLabel.AutoSize := False;
    GpuNoticeStatusLabel.WordWrap := True;
    NextTop := NextTop + ScaleY(24);

    ShortcutButton := TNewButton.Create(GpuNoticeForm);
    ShortcutButton.Parent := GpuNoticeForm;
    ShortcutButton.SetBounds(ScaleX(16), NextTop, ScaleX(328), ScaleY(28));
    ShortcutButton.Caption := '建立「Antigravity 安全模式（停用 GPU）」捷徑';
    ShortcutButton.OnClick := @CreateGpuSafeModeShortcut;
    NextTop := NextTop + ScaleY(34);

    CopyButton := TNewButton.Create(GpuNoticeForm);
    CopyButton.Parent := GpuNoticeForm;
    CopyButton.SetBounds(ScaleX(16), NextTop, ScaleX(142), ScaleY(26));
    CopyButton.Caption := '複製 --disable-gpu';
    CopyButton.OnClick := @CopyDisableGpuArgument;

    DoneButton := TNewButton.Create(GpuNoticeForm);
    DoneButton.Parent := GpuNoticeForm;
    DoneButton.SetBounds(ScaleX(256), NextTop, ScaleX(88), ScaleY(26));
    DoneButton.Caption := '完成';
    DoneButton.Default := True;
    DoneButton.Cancel := True;
    DoneButton.ModalResult := mrOk;

    GpuNoticeForm.ActiveControl := DoneButton;
    GpuNoticeForm.ShowModal;
  finally
    GpuNoticeStatusLabel := nil;
    GpuNoticeForm.Free;
    GpuNoticeForm := nil;
  end;
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
#if Mode == "Install"
  SetInstallerPhase(15, '正在檢查 Antigravity 相容性…');
#else
  SetInstallerPhase(15, '正在準備還原官方英文…');
#endif
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
  ResolvedAntigravityDir := LogDir + '\last-Preflight.install-dir.txt';
  DeleteFile(SummaryPath);
  DeleteFile(JsonPath);
  DeleteFile(ResolvedAntigravityDir);

  ExtraArguments := '';
  AntigravityDir := ExpandConstant('{param:AntigravityDir|}');
  if AntigravityDir <> '' then
    ExtraArguments := ' --install-dir "' + AntigravityDir + '"';
  if not ProcessSafetyBypassAllowed() then
    ExtraArguments := ExtraArguments + ' --require-not-running';

  CommandLine := '/D /S /C ""' + NodePath + '" "' + AuditorPath + '"' + ExtraArguments +
    ' --require-verified --json "' + JsonPath + '" --resolved-install-dir "' + ResolvedAntigravityDir +
    '" --error-summary "' + SummaryPath +
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
    exit;
  end;
  ResolvedAntigravityDir := LoadFirstUTF8Line(ResolvedAntigravityDir);
  SetInstallerPhase(45, '正在準備繁體中文化…');
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
  if CurStep = ssPostInstall then begin
    if EngineSucceeded then begin
      InstallOperationSucceeded := True;
#if Mode == "Install"
      SetInstallerPhase(100, '安裝完成');
#else
      SetInstallerPhase(100, '還原完成');
#endif
    end;
    exit;
  end;

  if CurStep <> ssInstall then
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
#if Mode == "Install"
  SetInstallerPhase(80, '正在套用繁體中文化並驗證安裝結果…');
#else
  SetInstallerPhase(80, '正在還原官方英文並驗證安裝結果…');
#endif
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

  EngineSucceeded := True;
#if Mode == "Install"
  SetInstallerPhase(95, '正在完成安裝…');
#else
  SetInstallerPhase(95, '正在完成還原…');
#endif
end;

procedure CurPageChanged(CurPageID: Integer);
begin
#if Mode == "Install"
  if (CurPageID = wpFinished) and InstallOperationSucceeded and
    (not GpuNoticeShown) and (not WizardSilent) and IsAffectedWindowsGpuBuild() then begin
    GpuNoticeShown := True;
    ShowGpuKnownIssueNotice();
  end;
#endif
end;
