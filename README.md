# Description

An app for Mazda with the following features:
- calculation of engine working hours
- output of oil sensor readings (temperature, level, pressure)
- output of pressure in the wheels

Screenshots are available [here](/screenshots).

## Build

Run the `make build` command. The `carmon` folder with the application will be created in the project root. You can download the already built application carmon-v[...].zip on the [release page](https://github.com/sdv43/carmon/releases).

## Installation

You need access to the machine's sh console to execute scripts. Previously, you can copy the `carmon` folder to a USB flash drive and connect it to the machine or upload files via `scp`.

To install the application, you need to run the following commands in the console:
- `./scripts/backup.sh`
- `./scripts/install.sh`
- `reboot`

## Scripts in scripts folder

All available scripts that can be executed on the machine's system are in the `scripts` folder.

### install.sh

The script installs the application. It copies and modifies files in the system. Also it creates a backup files next to the source files with the extension `.bak`.

### uninstall.sh

The script deletes the application. It restores modified files from `.bak` files. After recovery, it deletes `.bak` files from the system.

### backup.sh

The script makes a backup of files that change during execution `install.sh`. The script creates copies of files next to the source files with the extension `.backup`. These files are not modified or deleted when executed `uninstall.sh`.

If you need to completely remove the application from the system, then delete these files manually. The full list of files is inside `backup.sh`.

### diff.sh

The script displays the file difference between the `.backup` files and the current files in the system. It's useful to track changes in the system files after execution `install.sh` or `uninstall.sh`.

## Development

To test or develop an application locally, you need to run the `make up` command. The application will be available at `http://localhost:2900`.

You need to specify the path to jci folder in the `Makefile` file on line 9. This is the folder with the source files of the mazda's system. You can get it by unpacking the up-file with the firmware. These files are needed:
- `/jci/gui` - the whole folder, since the entire web application is there
- `/jci/scripts/stage_wifi.sh`
- `/jci/sm/sm.conf`

Thus, it can be possible to connect different firmware versions and test the application. I tested on version EU_70.00.367A.

Special thanks to this project https://github.com/flyandi/mazda-custom-application-sdk