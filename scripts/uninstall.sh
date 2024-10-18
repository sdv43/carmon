#!/bin/sh

restore_backup_file() {
    cp -a "$1.bak" $1
    rm "$1.bak"
    echo "File ${1##*/} was restored"
}

is_backup_exists() {
    [ -e "$1.bak" ]
}

if [ -e "/jci/scripts/show_version.sh" ]; then
    mount -o rw,remount /
    pkill carmon
fi

if is_backup_exists /jci/sm/sm.conf; then
    restore_backup_file /jci/sm/sm.conf
fi

if [ -d "/tmp/mnt/data_persist/carmon" ]; then
    rm /jci/gui/carmon
    rm -rf /tmp/mnt/data_persist/carmon

    echo "App files were removed"
fi

if is_backup_exists /jci/scripts/stage_wifi.sh; then
    restore_backup_file /jci/scripts/stage_wifi.sh
fi

if is_backup_exists /jci/gui/index.html; then
    restore_backup_file /jci/gui/index.html
fi

if is_backup_exists /jci/gui/framework/js/GuiFramework.js; then
    restore_backup_file /jci/gui/framework/js/GuiFramework.js
fi

if is_backup_exists /jci/gui/resources/js/schedmaint/schedmaintAppDict_ru_RU.js; then
    restore_backup_file /jci/gui/resources/js/schedmaint/schedmaintAppDict_ru_RU.js
fi

if is_backup_exists /jci/gui/apps/schedmaint/js/schedmaintApp.js; then
    restore_backup_file /jci/gui/apps/schedmaint/js/schedmaintApp.js
fi

if is_backup_exists /jci/gui/resources/js/system/systemAppDict_ru_RU.js; then
    restore_backup_file /jci/gui/resources/js/system/systemAppDict_ru_RU.js
fi

if is_backup_exists /jci/gui/apps/system/js/systemApp.js; then
    restore_backup_file /jci/gui/apps/system/js/systemApp.js
fi
