# Emby
适用于Emby 4.6.7
# 使用说明
安装依赖（新机器必须运行一次，此后无需运行）

	yum install -y curl wget 2> /dev/null || apt install -y curl wget

安装Emby Ubuntu X64命令

     wget https://github.com/MediaBrowser/Emby.Releases/releases/download/4.6.7.0/emby-server-deb_4.6.7.0_amd64.deb
   
     dpkg -i emby-server-deb_4.6.7.0_amd64.deb


安装Emby Ubuntu Arm64 (aarch64)

     wget https://github.com/MediaBrowser/Emby.Releases/releases/download/4.6.7.0/emby-server-deb_4.6.7.0_arm64.deb
   
     dpkg -i emby-server-deb_4.6.7.0_arm64.deb
   
安装破解脚本

     wget -O ubuntu_crack.sh https://raw.githubusercontent.com/wangsicong120/Emby/main/ubuntu_crack.sh && chmod +x ubuntu_crack.sh && clear && ./ubuntu_crack.sh
