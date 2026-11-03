class MovieboxTui < Formula
  VERSION = "0.1.25"
  MACOS_SHA256 = "6cfae04deb1950ff8ca3ae832f5b0c658960e09cce4e1a30df9397833d79eb67"
  LINUX_X64_SHA256 = "afce8a9fe5e203829893a127ef41635f208fd7e90837bb5be1ba77a89b0f09bb"
  LINUX_ARM64_SHA256 = "066a7361d601bf36ca0e7d602d29a4ffcab83adc04a6c070ab010055495fbe29"

  desc "Stream movies, shows, anime, and live TV from your terminal"
  homepage "https://github.com/mesamirh/MovieBox-Tui"
  version VERSION
  license any_of: ["MIT", "Apache-2.0"]

  on_macos do
    url "https://github.com/mesamirh/MovieBox-Tui/releases/download/v#{VERSION}/MovieBox_macOS_Universal.tar.gz"
    sha256 MACOS_SHA256
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/mesamirh/MovieBox-Tui/releases/download/v#{VERSION}/MovieBox_Linux_arm64.tar.gz"
      sha256 LINUX_ARM64_SHA256
    else
      url "https://github.com/mesamirh/MovieBox-Tui/releases/download/v#{VERSION}/MovieBox_Linux_x64.tar.gz"
      sha256 LINUX_X64_SHA256
    end
  end

  def install
    bin.install "moviebox-tui"
  end

  test do
    system "#{bin}/moviebox-tui", "--version"
  end
end
