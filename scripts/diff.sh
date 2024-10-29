#!/bin/sh

diff_file() {
    modified_file="$1.backup"

    if [ ! -e $modified_file ]; then
        echo "Warning: Backup for file ${1##*/} does not exists"
    else
        echo "#### ${1##*/} ####"
        diff $modified_file $1

        if [ $? -eq 0 ]; then
            echo "No changes"
        fi

        echo ""
    fi
}

diff_file /jci/sm/sm.conf
diff_file /jci/scripts/stage_wifi.sh
diff_file /jci/gui/index.html
diff_file /jci/gui/framework/js/GuiFramework.js
diff_file /jci/gui/resources/js/schedmaint/schedmaintAppDict_ru_RU.js
diff_file /jci/gui/apps/schedmaint/js/schedmaintApp.js
diff_file /jci/gui/resources/js/system/systemAppDict_ru_RU.js
diff_file /jci/gui/apps/system/js/systemApp.js
diff_file /jci/gui/common/controls/StatusBar/js/StatusBarCtrl.js
