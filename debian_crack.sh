echo "群晖 Emby 套件版一键破解脚本，适配3.5版本"
echo "-------------------web端破解-------------------"
rm -f /opt/emby-server/system/Emby.Web.dll
wget -P /opt/emby-server/system/ https://act.jiawei.xin:10086/tmp/emby/4.6.7.0/debian64-4.6.7/Emby.Web.dll
rm -f /opt/emby-server/system/MediaBrowser.Model.dll
wget -P /opt/emby-server/system/ https://act.jiawei.xin:10086/tmp/emby/4.6.7.0/debian64-4.6.7/MediaBrowser.Model.dll
echo "核心破解完成..."
rm -f /opt/emby-server/system/dashboard-ui/bower_components/emby-apiclient/connectionmanager.js
wget -P /opt/emby-server/system/dashboard-ui/bower_components/emby-apiclient/ https://act.jiawei.xin:10086/tmp/emby/4.6.7.0/debian64-4.6.7/connectionmanager.js
rm -f /opt/emby-server/system/dashboard-ui/embypremiere/embypremiere.js
wget -P /opt/emby-server/system/dashboard-ui/embypremiere/ https://act.jiawei.xin:10086/tmp/emby/4.6.7.0/debian64-4.6.7/embypremiere.js
echo "web破解完成..."
rm -f /opt/emby-server/system/Emby.Server.Implementations.dll
wget -P /opt/emby-server/system/ https://act.jiawei.xin:10086/tmp/emby/4.6.7.0/debian64-4.6.7/Emby.Server.Implementations.dll
echo "Implementations替换认证..."
echo "完成..."
