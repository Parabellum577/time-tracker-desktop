# timeguard3_activitydetection

```bash
# All Hook modules have global varaibles that indicates mouse and keyboard rates.
# run module as usual C/C++ console app and it will hook devices and log using info right in console dialog
# just use GCC for C/C++ code building


# --------------------------------
# IMPORTANT: Darwin module works only for ROOT USER
# Darwin code

gcc -Wall -o OUTPUT_FILE MODULE.c -framework ApplicationServices

# run it

sudo ./OUTPUT_FILE


# --------------------------------
# IMPORTANT: Linux module works only for ROOT USER, or need to write additional permissions to all the files in dev/input/by-path
# just open dir mentioned previously and do the next

sudo chmod a+r *

# or you can do the same as to darwin code

gcc -o OUTPUT_FILE MODULE.c

# and run it

sudo ./OUTPUT_FILE


# --------------------------------
# For Windows C++ code do the next

g++ MODULE.cpp -o OUTPUT_FILE.exe

# run it

OUTPUT_FILE.exe


# --------------------------------
# all the hooks have simple MATH calculation TOTAL(CLICKS or PRESSES) / MINUTES OF USAGE
# needs some rules and inprovements for smart tracking

```

```
	Try file
# --------------------------------
const test = require('./build/Release/modulename');
test.Track();
var timerId = setInterval(function(){
	console.log("MS tare =" + test.Mouse());
	console.log("KB tare =" + test.Keyboard());
});

```
