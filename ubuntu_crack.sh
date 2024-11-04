echo "Emby4.6.7版本"
echo "-------------------web端破解-------------------"
rm -f /opt/emby-server/system/Emby.Web.dll
wget https://github.com/wangsicong120/Emby/blob/main/Emby.Web.dll -P /opt/emby-server/system/
rm -f /opt/emby-server/system/MediaBrowser.Model.dll
wget MediaBrowser.Model.dll https://github.com/wangsicong120/Emby/raw/main/MediaBrowser.Model.dll -P /opt/emby-server/system/
echo "核心破解完成..."
rm -f /opt/emby-server/system/dashboard-ui/bower_components/emby-apiclient/connectionmanager.js
wget https://raw.githubusercontent.com/wangsicong120/Emby/main/connectionmanager.js -P /opt/emby-server/system/dashboard-ui/bower_components/emby-apiclient/
rm -f /opt/emby-server/system/dashboard-ui/embypremiere/embypremiere.js
wget https://raw.githubusercontent.com/wangsicong120/Emby/main/embypremiere.js -P /opt/emby-server/system/dashboard-ui/embypremiere/
echo "web破解完成..."
rm -f /opt/emby-server/system/Emby.Server.Implementations.dll
wget https://github.com/wangsicong120/Emby/raw/main/Emby.Server.Implementations.dll -P /opt/emby-server/system/
echo "Implementations替换认证..."
echo "完成..."
