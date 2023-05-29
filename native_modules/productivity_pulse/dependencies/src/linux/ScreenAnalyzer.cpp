#include <ScreenAnalyzer.h>

#ifdef __linux__
#include <X11/Xlib.h>
#include <X11/Xatom.h>
#include <X11/Xutil.h>
#include <assert.h>
#endif

static void *x11property(Display *display, Window window, Atom property, Atom type, int *nitems)
{
    Atom type_ret;
    int format_ret;
    unsigned long items_ret;
    unsigned long after_ret;
    unsigned char *prop_data = 0;

    if (XGetWindowProperty(display, window, property, 0, 0x7fffffff, False, type, &type_ret, &format_ret, &items_ret, &after_ret, &prop_data) != Success)
    {
        return 0;
    }

    if (nitems)
    {
        *nitems = items_ret;
    }

    return prop_data;
}

namespace SA
{
static Display *display = 0;

int X_error_handler(Display *d, XErrorEvent *e)
{
    char msg[100];
    XGetErrorText(d, e->error_code, msg, sizeof(msg));
    printf("lX11 error occured\n");
}

Display *currentDisplay()
{
    if (!display)
    {
        XSetErrorHandler(X_error_handler);
        display = XOpenDisplay(NULL);
    }
    return display;
}

void cleanupDisplay()
{
    if (!display)
    {
        return;
    }
    XCloseDisplay(display);
    display = 0;
}

std::string getWindowName(Window window)
{
    Atom netWmName = XInternAtom(currentDisplay(), "_NET_WM_NAME", false);
    XTextProperty windowNameTextProperty;

    XGetTextProperty(display, window, &windowNameTextProperty, netWmName);
    if (!windowNameTextProperty.nitems)
    {
        XGetWMName(currentDisplay(), window, &windowNameTextProperty);
    }

    if (!windowNameTextProperty.nitems)
    {
        return "error";
    }

    std::string windowName;
    windowName = (char *)windowNameTextProperty.value;
    XFree(windowNameTextProperty.value);

    return windowName;
}

std::string nameOfCurrentlyActiveWindow()
{
    Atom atom_active_window = XInternAtom(currentDisplay(), "_NET_ACTIVE_WINDOW", False);

    Window rootWindow = DefaultRootWindow(currentDisplay());
    Window *activeWindow = static_cast<Window *>(x11property(currentDisplay(), rootWindow, atom_active_window, XA_WINDOW, NULL));

    std::string windowName;
    if (activeWindow)
    {
        windowName = getWindowName(*activeWindow);
    }

    cleanupDisplay();

    return windowName;
}
} // namespace SA
