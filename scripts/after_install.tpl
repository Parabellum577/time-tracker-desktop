#!/bin/sh
# Link to the binary
ln -sf '/opt/timetracker/timetracker' '/usr/bin/timetracker'

update-mime-database /usr/share/mime || true
update-desktop-database /usr/share/applications || true
timetracker &
exit 0