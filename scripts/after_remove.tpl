#!/bin/sh
find ~/.config -iname '${executable}' | xargs rm -rf
pkill "${executable}"
exit 0