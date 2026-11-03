using System;
using System.Drawing;
using System.IO;
using System.Text.Json;
using System.Windows.Forms;

namespace LCDLineTool;

public class Settings
{
    public bool Enabled { get; set; } = true;
    public int X { get; set; } = 0;
    public int Y { get; set; } = 0;
    public int Width { get; set; } = 100;
    public int Height { get; set; } = 2;
}

static class Program
{
    static string SettingsPath =>
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                     "LCDLineTool", "settings.json");

    static Settings S = Load();
    static Overlay? overlay;
    static NotifyIcon? tray;
    static Form? settingsForm;

    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();

        tray = new NotifyIcon
        {
            Icon = SystemIcons.Application,
            Visible = true,
            Text = "LCD Line Tool"
        };

        var menu = new ContextMenuStrip();
        var toggle = new ToolStripMenuItem();
        var edit = new ToolStripMenuItem("Settings");
        var exit = new ToolStripMenuItem("Exit");

        toggle.Click += (_, _) => SetEnabled(!S.Enabled);
        edit.Click += (_, _) => ShowSettings();
        exit.Click += (_, _) =>
        {
            Save();
            overlay?.Close();
            tray.Visible = false;
            tray.Dispose();
            Application.Exit();
        };

        menu.Items.Add(toggle);
        menu.Items.Add(edit);
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add(exit);
        tray.ContextMenuStrip = menu;
        tray.DoubleClick += (_, _) => ShowSettings();

        void RefreshMenu()
        {
            toggle.Text = S.Enabled ? "Turn OFF" : "Turn ON";
        }

        tray.Tag = RefreshMenu;
        RefreshMenu();

        if (S.Enabled) ShowOverlay();

        Application.ApplicationExit += (_, _) =>
        {
            Save();
            overlay?.Close();
        };

        Application.Run();
    }

    static void SetEnabled(bool enabled)
    {
        S.Enabled = enabled;
        Save();
        if (enabled) ShowOverlay();
        else HideOverlay();
        if (tray?.ContextMenuStrip?.Items.Count > 0)
            ((ToolStripMenuItem)tray.ContextMenuStrip.Items[0]).Text =
                enabled ? "Turn OFF" : "Turn ON";
    }

    static void ShowOverlay()
    {
        if (overlay == null || overlay.IsDisposed)
        {
            overlay = new Overlay();
            overlay.Show();
        }
        else
        {
            overlay.UpdateBounds();
            overlay.Show();
        }
    }

    static void HideOverlay()
    {
        if (overlay != null && !overlay.IsDisposed) overlay.Hide();
    }

    static void ShowSettings()
    {
        if (settingsForm != null && !settingsForm.IsDisposed)
        {
            settingsForm.Activate();
            return;
        }

        settingsForm = new Form
        {
            Text = "LCD Line Tool",
            ClientSize = new Size(360, 280),
            FormBorderStyle = FormBorderStyle.FixedDialog,
            MaximizeBox = false,
            MinimizeBox = false,
            StartPosition = FormStartPosition.CenterScreen,
            TopMost = true
        };

        var x = AddNumber(settingsForm, "X position", S.X, 20, 20, 100000);
        var y = AddNumber(settingsForm, "Y position", S.Y, 20, 60, 100000);
        var w = AddNumber(settingsForm, "Line length", S.Width, 20, 100, 100000);
        var h = AddNumber(settingsForm, "Thickness", S.Height, 20, 140, 100);

        var on = new CheckBox
        {
            Text = "Line ON",
            Checked = S.Enabled,
            AutoSize = true,
            Location = new Point(20, 185)
        };
        settingsForm.Controls.Add(on);

        var apply = new Button
        {
            Text = "Apply & Save",
            Location = new Point(190, 185),
            Size = new Size(130, 35)
        };
        settingsForm.Controls.Add(apply);

        var close = new Button
        {
            Text = "Close",
            Location = new Point(190, 225),
            Size = new Size(130, 35)
        };
        settingsForm.Controls.Add(close);

        apply.Click += (_, _) =>
        {
            S.X = (int)x.Value;
            S.Y = (int)y.Value;
            S.Width = Math.Max(1, (int)w.Value);
            S.Height = Math.Max(1, (int)h.Value);
            S.Enabled = on.Checked;
            Save();

            if (S.Enabled) ShowOverlay();
            else HideOverlay();

            if (tray?.ContextMenuStrip?.Items.Count > 0)
                ((ToolStripMenuItem)tray.ContextMenuStrip.Items[0]).Text =
                    S.Enabled ? "Turn OFF" : "Turn ON";
        };

        close.Click += (_, _) => settingsForm!.Close();
        settingsForm.FormClosed += (_, _) => settingsForm = null;
        settingsForm.Show();
    }

    static NumericUpDown AddNumber(Form f, string label, int value, int x, int y, int max)
    {
        f.Controls.Add(new Label { Text = label, Location = new Point(x, y + 3), AutoSize = true });
        var n = new NumericUpDown
        {
            Location = new Point(150, y),
            Size = new Size(150, 24),
            Minimum = 0,
            Maximum = max,
            Value = Math.Clamp(value, 0, max)
        };
        f.Controls.Add(n);
        return n;
    }

    static Settings Load()
    {
        try
        {
            if (File.Exists(SettingsPath))
                return JsonSerializer.Deserialize<Settings>(File.ReadAllText(SettingsPath)) ?? new Settings();
        }
        catch { }
        return new Settings();
    }

    static void Save()
    {
        try
        {
            var dir = Path.GetDirectoryName(SettingsPath)!;
            Directory.CreateDirectory(dir);
            File.WriteAllText(SettingsPath,
                JsonSerializer.Serialize(S, new JsonSerializerOptions { WriteIndented = true }));
        }
        catch { }
    }

    class Overlay : Form
    {
        public Overlay()
        {
            FormBorderStyle = FormBorderStyle.None;
            ShowInTaskbar = false;
            TopMost = true;
            BackColor = Color.White;
            StartPosition = FormStartPosition.Manual;
            AutoScaleMode = AutoScaleMode.None;
            UpdateBounds();
        }

        protected override bool ShowWithoutActivation => true;

        protected override CreateParams CreateParams
        {
            get
            {
                var cp = base.CreateParams;
                cp.ExStyle |= 0x00000020; // WS_EX_TRANSPARENT
                cp.ExStyle |= 0x00000080; // WS_EX_TOOLWINDOW
                cp.ExStyle |= 0x00000008; // WS_EX_TOPMOST
                return cp;
            }
        }

        public void UpdateBounds()
        {
            var screen = Screen.PrimaryScreen!.Bounds;
            Location = new Point(screen.Left + S.X, screen.Top + S.Y);
            Size = new Size(Math.Max(1, S.Width), Math.Max(1, S.Height));
        }

        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            UpdateBounds();
        }
    }
}
