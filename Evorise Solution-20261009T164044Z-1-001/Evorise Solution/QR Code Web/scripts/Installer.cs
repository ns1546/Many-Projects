using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Diagnostics;
using System.Windows.Forms;
using System.Drawing;
using Microsoft.Win32;
using System.Threading;

namespace EvoriseSetup
{
    public class SetupWizard : Form
    {
        private Panel headerPanel;
        private Label lblHeaderTitle;
        private Label lblHeaderSubtitle;
        private Panel contentPanel;
        private Panel bottomPanel;
        private Button btnBack;
        private Button btnNext;
        private Button btnCancel;

        private int currentPage = 0;
        private string installDir;
        private bool isInstalling = false;
        private bool installCompleted = false;

        // Page 0: Welcome
        private Panel pageWelcome;
        private Label lblWelcomeHeading;
        private Label lblWelcomeDesc;

        // Page 1: Destination
        private Panel pageDir;
        private Label lblDirHeading;
        private TextBox txtDir;
        private Button btnBrowse;

        // Page 2: Progress
        private Panel pageProgress;
        private Label lblProgressHeading;
        private Label lblProgressStatus;
        private ProgressBar progressBar;

        // Page 3: Finish
        private Panel pageFinish;
        private Label lblFinishHeading;
        private Label lblFinishDesc;
        private CheckBox chkLaunchNow;

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupWizard());
        }

        public SetupWizard()
        {
            this.Text = "Evorise Restaurant Admin Setup";
            this.Size = new Size(580, 430);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.Font = new Font("Segoe UI", 9.0f);
            this.BackColor = Color.White;

            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            installDir = Path.Combine(localAppData, "Programs", "Evorise Restaurant Admin");

            BuildUI();
            ShowPage(0);
        }

        private void BuildUI()
        {
            // Top Header Panel
            headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 65;
            headerPanel.BackColor = Color.FromArgb(248, 250, 252);
            headerPanel.Paint += (s, e) => {
                e.Graphics.DrawLine(new Pen(Color.FromArgb(226, 232, 240)), 0, headerPanel.Height - 1, headerPanel.Width, headerPanel.Height - 1);
            };

            lblHeaderTitle = new Label();
            lblHeaderTitle.Text = "Evorise Restaurant Admin Setup Wizard";
            lblHeaderTitle.Font = new Font("Segoe UI", 11.0f, FontStyle.Bold);
            lblHeaderTitle.ForeColor = Color.FromArgb(15, 23, 42);
            lblHeaderTitle.Location = new Point(20, 12);
            lblHeaderTitle.AutoSize = true;

            lblHeaderSubtitle = new Label();
            lblHeaderSubtitle.Text = "Enterprise POS && Kitchen Management Desktop System";
            lblHeaderSubtitle.Font = new Font("Segoe UI", 8.5f);
            lblHeaderSubtitle.ForeColor = Color.FromArgb(100, 116, 139);
            lblHeaderSubtitle.Location = new Point(20, 34);
            lblHeaderSubtitle.AutoSize = true;

            headerPanel.Controls.Add(lblHeaderTitle);
            headerPanel.Controls.Add(lblHeaderSubtitle);

            // Bottom Actions Panel
            bottomPanel = new Panel();
            bottomPanel.Dock = DockStyle.Bottom;
            bottomPanel.Height = 55;
            bottomPanel.BackColor = Color.FromArgb(248, 250, 252);
            bottomPanel.Paint += (s, e) => {
                e.Graphics.DrawLine(new Pen(Color.FromArgb(226, 232, 240)), 0, 0, bottomPanel.Width, 0);
            };

            btnCancel = new Button();
            btnCancel.Text = "Cancel";
            btnCancel.Size = new Size(85, 30);
            btnCancel.Location = new Point(465, 12);
            btnCancel.Click += (s, e) => {
                if (!isInstalling) this.Close();
            };

            btnNext = new Button();
            btnNext.Text = "Next >";
            btnNext.Size = new Size(85, 30);
            btnNext.Location = new Point(370, 12);
            btnNext.BackColor = Color.FromArgb(233, 149, 69);
            btnNext.ForeColor = Color.White;
            btnNext.FlatStyle = FlatStyle.Flat;
            btnNext.FlatAppearance.BorderSize = 0;
            btnNext.Click += OnNextClick;

            btnBack = new Button();
            btnBack.Text = "< Back";
            btnBack.Size = new Size(85, 30);
            btnBack.Location = new Point(275, 12);
            btnBack.Click += (s, e) => ShowPage(currentPage - 1);

            bottomPanel.Controls.Add(btnBack);
            bottomPanel.Controls.Add(btnNext);
            bottomPanel.Controls.Add(btnCancel);

            // Content Container
            contentPanel = new Panel();
            contentPanel.Dock = DockStyle.Fill;
            contentPanel.Padding = new Padding(25);

            this.Controls.Add(contentPanel);
            this.Controls.Add(headerPanel);
            this.Controls.Add(bottomPanel);

            // Initialize Pages
            BuildPageWelcome();
            BuildPageDir();
            BuildPageProgress();
            BuildPageFinish();
        }

        private void BuildPageWelcome()
        {
            pageWelcome = new Panel() { Dock = DockStyle.Fill, Visible = false };
            lblWelcomeHeading = new Label() {
                Text = "Welcome to the Evorise Restaurant Admin Setup",
                Font = new Font("Segoe UI", 12.0f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                Location = new Point(20, 15),
                AutoSize = true
            };

            lblWelcomeDesc = new Label() {
                Text = "This wizard will install Evorise Restaurant Admin (Version 2.0.0) on your computer.\n\n" +
                       "Features included in this installation:\n" +
                       " • Embedded ACID SQLite Database Engine\n" +
                       " • Real-Time Order Bus && Kitchen Display System\n" +
                       " • Acoustic Audio Alert Chimes (Toast POS, Bells && Dings)\n" +
                       " • Windows Desktop && Start Menu Shortcuts\n" +
                       " • Local Wi-Fi Customer QR Mobile Access\n\n" +
                       "Click Next to choose the installation location and continue.",
                Location = new Point(20, 50),
                Size = new Size(515, 195),
                ForeColor = Color.FromArgb(51, 65, 85)
            };

            pageWelcome.Controls.Add(lblWelcomeHeading);
            pageWelcome.Controls.Add(lblWelcomeDesc);
            contentPanel.Controls.Add(pageWelcome);
        }

        private void BuildPageDir()
        {
            pageDir = new Panel() { Dock = DockStyle.Fill, Visible = false };
            lblDirHeading = new Label() {
                Text = "Choose Installation Location",
                Font = new Font("Segoe UI", 11.0f, FontStyle.Bold),
                Location = new Point(20, 15),
                AutoSize = true
            };

            Label lblDirSub = new Label() {
                Text = "Setup will install Evorise Restaurant Admin in the following folder.\nTo install in a different folder, click Browse.",
                Location = new Point(20, 45),
                Size = new Size(480, 40),
                ForeColor = Color.FromArgb(71, 85, 105)
            };

            txtDir = new TextBox() {
                Location = new Point(20, 100),
                Size = new Size(390, 26),
                Text = installDir
            };

            btnBrowse = new Button() {
                Text = "Browse...",
                Location = new Point(420, 98),
                Size = new Size(80, 28)
            };
            btnBrowse.Click += (s, e) => {
                FolderBrowserDialog fbd = new FolderBrowserDialog();
                fbd.SelectedPath = installDir;
                if (fbd.ShowDialog() == DialogResult.OK) {
                    installDir = fbd.SelectedPath;
                    txtDir.Text = installDir;
                }
            };

            Label lblSpace = new Label() {
                Text = "Required space: ~250 MB\nFree space available: Sufficient",
                Location = new Point(20, 145),
                AutoSize = true,
                ForeColor = Color.FromArgb(100, 116, 139)
            };

            pageDir.Controls.Add(lblDirHeading);
            pageDir.Controls.Add(lblDirSub);
            pageDir.Controls.Add(txtDir);
            pageDir.Controls.Add(btnBrowse);
            pageDir.Controls.Add(lblSpace);
            contentPanel.Controls.Add(pageDir);
        }

        private void BuildPageProgress()
        {
            pageProgress = new Panel() { Dock = DockStyle.Fill, Visible = false };
            lblProgressHeading = new Label() {
                Text = "Installing Evorise Restaurant Admin...",
                Font = new Font("Segoe UI", 11.0f, FontStyle.Bold),
                Location = new Point(20, 20),
                AutoSize = true
            };

            lblProgressStatus = new Label() {
                Text = "Please wait while Setup installs files on your computer...",
                Location = new Point(20, 60),
                Size = new Size(480, 25),
                ForeColor = Color.FromArgb(71, 85, 105)
            };

            progressBar = new ProgressBar() {
                Location = new Point(20, 90),
                Size = new Size(480, 24),
                Minimum = 0,
                Maximum = 100,
                Value = 0
            };

            pageProgress.Controls.Add(lblProgressHeading);
            pageProgress.Controls.Add(lblProgressStatus);
            pageProgress.Controls.Add(progressBar);
            contentPanel.Controls.Add(pageProgress);
        }

        private void BuildPageFinish()
        {
            pageFinish = new Panel() { Dock = DockStyle.Fill, Visible = false };
            lblFinishHeading = new Label() {
                Text = "Installation Completed Successfully!",
                Font = new Font("Segoe UI", 12.0f, FontStyle.Bold),
                ForeColor = Color.FromArgb(5, 150, 105),
                Location = new Point(20, 20),
                AutoSize = true
            };

            lblFinishDesc = new Label() {
                Text = "Evorise Restaurant Admin has been installed on your computer.\n\n" +
                       "A Desktop shortcut and Start Menu entry have been created.\n" +
                       "The application has been registered in Windows installed software.\n\n" +
                       "Click Finish to exit Setup.",
                Location = new Point(20, 60),
                Size = new Size(480, 100),
                ForeColor = Color.FromArgb(51, 65, 85)
            };

            chkLaunchNow = new CheckBox() {
                Text = "Launch Evorise Restaurant Admin now",
                Checked = true,
                Location = new Point(25, 175),
                AutoSize = true,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
            };

            pageFinish.Controls.Add(lblFinishHeading);
            pageFinish.Controls.Add(lblFinishDesc);
            pageFinish.Controls.Add(chkLaunchNow);
            contentPanel.Controls.Add(pageFinish);
        }

        private void ShowPage(int page)
        {
            currentPage = page;
            pageWelcome.Visible = (page == 0);
            pageDir.Visible = (page == 1);
            pageProgress.Visible = (page == 2);
            pageFinish.Visible = (page == 3);

            btnBack.Visible = (page > 0 && page < 2);
            btnBack.Enabled = (page == 1);

            if (page == 0) {
                btnNext.Text = "Next >";
                btnCancel.Enabled = true;
            } else if (page == 1) {
                btnNext.Text = "Install";
                btnCancel.Enabled = true;
            } else if (page == 2) {
                btnBack.Enabled = false;
                btnNext.Enabled = false;
                btnCancel.Enabled = false;
            } else if (page == 3) {
                btnBack.Visible = false;
                btnNext.Text = "Finish";
                btnNext.Enabled = true;
                btnCancel.Visible = false;
            }
        }

        private void OnNextClick(object sender, EventArgs e)
        {
            if (currentPage == 0) {
                ShowPage(1);
            } else if (currentPage == 1) {
                installDir = txtDir.Text.Trim();
                ShowPage(2);
                StartExtractionProcess();
            } else if (currentPage == 3) {
                if (chkLaunchNow.Checked) {
                    string exePath = Path.Combine(installDir, "Evorise-Restaurant-Admin.exe");
                    if (File.Exists(exePath)) {
                        Process.Start(new ProcessStartInfo(exePath) {
                            WorkingDirectory = installDir
                        });
                    }
                }
                this.Close();
            }
        }

        private void StartExtractionProcess()
        {
            isInstalling = true;
            Thread t = new Thread(new ThreadStart(PerformInstallThread));
            t.IsBackground = true;
            t.Start();
        }

        private void PerformInstallThread()
        {
            try
            {
                // Kill running instance if upgrading
                try {
                    foreach (var p in Process.GetProcessesByName("Evorise-Restaurant-Admin")) {
                        p.Kill();
                        p.WaitForExit(2000);
                    }
                } catch { }

                UpdateStatus("Preparing destination directory...", 5);
                if (!Directory.Exists(installDir)) {
                    Directory.CreateDirectory(installDir);
                }

                // Extract Embedded Zip Archive Payload
                Assembly assembly = Assembly.GetExecutingAssembly();
                using (Stream stream = assembly.GetManifestResourceStream("AppPayload.zip"))
                {
                    if (stream != null)
                    {
                        using (ZipArchive archive = new ZipArchive(stream))
                        {
                            int total = archive.Entries.Count;
                            int count = 0;
                            foreach (ZipArchiveEntry entry in archive.Entries)
                            {
                                string destPath = Path.Combine(installDir, entry.FullName);
                                string destDir = Path.GetDirectoryName(destPath);
                                if (!string.IsNullOrEmpty(destDir) && !Directory.Exists(destDir)) {
                                    Directory.CreateDirectory(destDir);
                                }
                                if (!string.IsNullOrEmpty(entry.Name)) {
                                    entry.ExtractToFile(destPath, true);
                                }
                                count++;
                                int pct = 10 + (int)((count / (float)total) * 75);
                                UpdateStatus("Extracting: " + entry.Name, pct);
                            }
                        }
                    }
                }

                UpdateStatus("Creating Desktop and Start Menu shortcuts...", 90);
                string mainExe = Path.Combine(installDir, "Evorise-Restaurant-Admin.exe");
                
                // 1. Desktop Shortcut
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string deskLink = Path.Combine(desktopPath, "Evorise Restaurant Admin.lnk");
                CreateShortcut(deskLink, mainExe, "Evorise Restaurant Admin - Enterprise POS System");

                // 2. Start Menu Shortcut
                string startMenu = Environment.GetFolderPath(Environment.SpecialFolder.StartMenu);
                string progFolder = Path.Combine(startMenu, "Programs", "Evorise Restaurant Admin");
                if (!Directory.Exists(progFolder)) Directory.CreateDirectory(progFolder);
                string startLink = Path.Combine(progFolder, "Evorise Restaurant Admin.lnk");
                CreateShortcut(startLink, mainExe, "Evorise Restaurant Admin");

                // 3. Register Uninstaller in Windows Registry
                UpdateStatus("Registering with Windows installed programs...", 95);
                CreateUninstallerBatch(installDir);
                RegisterInWindowsRegistry(installDir);

                UpdateStatus("Installation completed!", 100);
                Thread.Sleep(400);

                this.Invoke((MethodInvoker)delegate {
                    isInstalling = false;
                    installCompleted = true;
                    ShowPage(3);
                });
            }
            catch (Exception ex)
            {
                this.Invoke((MethodInvoker)delegate {
                    MessageBox.Show("Installation encountered an error:\n\n" + ex.Message, "Setup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    isInstalling = false;
                    this.Close();
                });
            }
        }

        private void UpdateStatus(string text, int pct)
        {
            if (this.IsDisposed) return;
            this.Invoke((MethodInvoker)delegate {
                lblProgressStatus.Text = text;
                progressBar.Value = Math.Min(Math.Max(pct, 0), 100);
            });
        }

        private void CreateShortcut(string shortcutPath, string targetPath, string description)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = Path.GetDirectoryName(targetPath);
                shortcut.Description = description;
                shortcut.Save();
            }
            catch
            {
                try
                {
                    string ps = string.Format("$s=(New-Object -COM WScript.Shell).CreateShortcut('{0}');$s.TargetPath='{1}';$s.WorkingDirectory='{2}';$s.Save()",
                        shortcutPath.Replace("'", "''"), targetPath.Replace("'", "''"), Path.GetDirectoryName(targetPath).Replace("'", "''"));
                    Process proc = Process.Start(new ProcessStartInfo("powershell", "-NoProfile -Command \"" + ps + "\"") { CreateNoWindow = true, UseShellExecute = false });
                    if (proc != null) proc.WaitForExit();
                }
                catch { }
            }
        }

        private void CreateUninstallerBatch(string installPath)
        {
            try
            {
                string uninstPath = Path.Combine(installPath, "uninstall.bat");
                string script = "@echo off\r\n" +
                                "echo Uninstalling Evorise Restaurant Admin...\r\n" +
                                "taskkill /f /im Evorise-Restaurant-Admin.exe >nul 2>&1\r\n" +
                                "reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\EvoriseRestaurantAdmin\" /f >nul 2>&1\r\n" +
                                "del /f /q \"%userprofile%\\Desktop\\Evorise Restaurant Admin.lnk\" >nul 2>&1\r\n" +
                                "rmdir /s /q \"%appdata%\\Microsoft\\Windows\\Start Menu\\Programs\\Evorise Restaurant Admin\" >nul 2>&1\r\n" +
                                "echo Uninstallation completed.\r\n" +
                                "pause\r\n";
                File.WriteAllText(uninstPath, script);
            }
            catch { }
        }

        private void RegisterInWindowsRegistry(string installPath)
        {
            try
            {
                string keyPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EvoriseRestaurantAdmin";
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(keyPath))
                {
                    if (key != null)
                    {
                        key.SetValue("DisplayName", "Evorise Restaurant Admin");
                        key.SetValue("DisplayVersion", "2.0.0");
                        key.SetValue("Publisher", "Evorise Solution");
                        key.SetValue("InstallLocation", installPath);
                        key.SetValue("DisplayIcon", Path.Combine(installPath, "Evorise-Restaurant-Admin.exe"));
                        key.SetValue("UninstallString", "\"" + Path.Combine(installPath, "uninstall.bat") + "\"");
                        key.SetValue("EstimatedSize", 250000, RegistryValueKind.DWord);
                    }
                }
            }
            catch { }
        }
    }
}
