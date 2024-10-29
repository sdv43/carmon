#!/bin/sh

backup_file() {
    bfile="$1.backup"

    if [ ! -e "$bfile" ]; then
        cp -a $1 $bfile
        echo "${1##*/} saved"
    else
        echo "${1##*/} already saved"
    fi
}

if [ -e "/jci/scripts/show_version.sh" ]; then
    mount -o rw,remount /
fi

backup_file /jci/sm/sm.conf
backup_file /jci/scripts/stage_wifi.sh
backup_file /jci/gui/index.html
backup_file /jci/gui/framework/js/GuiFramework.js
backup_file /jci/gui/resources/js/schedmaint/schedmaintAppDict_ru_RU.js
backup_file /jci/gui/apps/schedmaint/js/schedmaintApp.js
backup_file /jci/gui/resources/js/system/systemAppDict_ru_RU.js
backup_file /jci/gui/apps/system/js/systemApp.js
backup_file /jci/gui/common/controls/StatusBar/js/StatusBarCtrl.js
