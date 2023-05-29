#include <ScreenAnalyzer.h>

#ifdef WIN32
#include <windows.h>
#include <fcntl.h>
#include <stdlib.h>
#endif

std::wstring titleForWindow(HWND hwnd) {
	int bufsize = GetWindowTextLengthW(hwnd) + 1;
	std::wstring data;
	data.resize(bufsize, '\0');
	GetWindowTextW(hwnd, LPWSTR(data.c_str()), bufsize);
	return data;
}

namespace SA {
	std::string nameOfCurrentlyActiveWindow() {
		HWND window = GetForegroundWindow();
		std::wstring title = titleForWindow(window);
		int encodedTitleSize = WideCharToMultiByte(CP_UTF8, 0, title.c_str(), static_cast<int>(title.length()), nullptr, 0, nullptr, nullptr);
		std::string encodedTitle(encodedTitleSize, '\0');
		WideCharToMultiByte(CP_UTF8, 0, title.c_str(), static_cast<int>(title.length()), &encodedTitle[0], encodedTitleSize, nullptr, nullptr);
		return encodedTitle;
	}
}