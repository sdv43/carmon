#!/bin/sh

backup_file() {
    cp -a $1 "$1.bak"
    echo "File ${1##*/} was saved"
}

is_need_backup_file() {
    [ ! -e "$1.bak" ]
}

if [ -e "/jci/scripts/show_version.sh" ]; then
    mount -o rw,remount /
fi

if grep -q 'watchdog_enable="true"' /jci/sm/sm.conf; then
    backup_file /jci/sm/sm.conf

    sed -i 's/watchdog_enable="true"/watchdog_enable="false"/g' /jci/sm/sm.conf
    sed -i 's|args="-u /jci/gui/index.html"|args="-u /jci/gui/index.html --noWatchdogs"|g' /jci/sm/sm.conf

    echo "Watchdog was disabled"
fi

carmon_dir=/tmp/mnt/data_persist/carmon

if [ ! -d $carmon_ dir ]; then
    mkdir $carmon_dir

    cp -r "${0%/*}/../ui/dist/bundle.js" $carmon_dir
    cp -r "${0%/*}/../ui/dist/assets" $carmon_dir
    cp -r "${0%/*}/../api/dist/carmon" $carmon_dir

    echo "App files were copied"

    ln -sf $carmon_dir /jci/gui/carmon
    ln -sf "$carmon_dir/assets/IcnSbCarBatt_1.png" /jci/gui/common/images/icons/IcnSbCarBatt_1.png
    ln -sf "$carmon_dir/assets/IcnSbCarBatt_2.png" /jci/gui/common/images/icons/IcnSbCarBatt_2.png
    ln -sf "$carmon_dir/assets/IcnSbCarBatt_3.png" /jci/gui/common/images/icons/IcnSbCarBatt_3.png
    ln -sf "$carmon_dir/assets/IcnSbCarBatt_4.png" /jci/gui/common/images/icons/IcnSbCarBatt_4.png
fi

if is_need_backup_file /jci/scripts/stage_wifi.sh; then
    backup_file /jci/scripts/stage_wifi.sh

    carmon_bin="$carmon_dir/carmon"
    carmon_log="/var/log/running_log/carmon.txt"

    script="
health_file=\"$carmon_dir/health.txt\"

if [ -e \$health_file ]; then
    is=\$(cat \$health_file)
    
    if [ \"\$is\" = \"0\" ]; then
        exit
    fi
fi

echo \"0\" > \$health_file
$carmon_bin -server -wd=$carmon_dir > $carmon_log 2>&1 &
"

    echo "$script" >>/jci/scripts/stage_wifi.sh
fi

if is_need_backup_file /jci/gui/index.html; then
    backup_file /jci/gui/index.html

    sed \
        -i \
        -e '/HMI GUI/a\' \
        -e '<script src="carmon/bundle.js" type="text/javascript"></script>' \
        /jci/gui/index.html
fi

if is_need_backup_file /jci/gui/framework/js/GuiFramework.js; then
    backup_file /jci/gui/framework/js/GuiFramework.js

    echo 'applyMmuiExt();' >>/jci/gui/framework/js/GuiFramework.js
fi

if is_need_backup_file /jci/gui/resources/js/schedmaint/schedmaintAppDict_ru_RU.js; then
    backup_file /jci/gui/resources/js/schedmaint/schedmaintAppDict_ru_RU.js

    sed \
        -i \
        -e '/registerAppDictLoaded/i\' \
        -e 'applyEngineHoursDictRuExt();' \
        /jci/gui/resources/js/schedmaint/schedmaintAppDict_ru_RU.js
fi

if is_need_backup_file /jci/gui/apps/schedmaint/js/schedmaintApp.js; then
    backup_file /jci/gui/apps/schedmaint/js/schedmaintApp.js

    sed \
        -i \
        -e '/registerAppLoaded/i\' \
        -e 'applyEngineHoursExt();' \
        /jci/gui/apps/schedmaint/js/schedmaintApp.js
fi

if is_need_backup_file /jci/gui/resources/js/system/systemAppDict_ru_RU.js; then
    backup_file /jci/gui/resources/js/system/systemAppDict_ru_RU.js

    sed \
        -i \
        -e '/registerAppDictLoaded/i\' \
        -e 'applySensorsDictRuExt();' \
        /jci/gui/resources/js/system/systemAppDict_ru_RU.js
fi

if is_need_backup_file /jci/gui/apps/system/js/systemApp.js; then
    backup_file /jci/gui/apps/system/js/systemApp.js

    sed \
        -i \
        -e '/registerAppLoaded/i\' \
        -e 'applySensorsExt();' \
        /jci/gui/apps/system/js/systemApp.js
fi

if is_need_backup_file /jci/gui/common/controls/StatusBar/js/StatusBarCtrl.js; then
    backup_file /jci/gui/common/controls/StatusBar/js/StatusBarCtrl.js

    sed \
        -i \
        -e '/"Batt": "Batt",/a\' \
        -e '"CarBatt": "CarBatt",' \
        /jci/gui/common/controls/StatusBar/js/StatusBarCtrl.js

    sed \
        -i \
        -e 's/"Traffic", "Roaming"/"Traffic", "Roaming", "CarBatt"/' \
        /jci/gui/common/controls/StatusBar/js/StatusBarCtrl.js
fi
