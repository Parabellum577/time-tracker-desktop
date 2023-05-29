#define _WIN32_WINNT 0x0400
#pragma comment( lib, "user32.lib" )

#include <node.h>
#include <iostream>
#include <windows.h>
#include <stdio.h>
#include <time.h>


using namespace node;
using namespace v8;

HHOOK hKeyboardHook;
HHOOK hMouseHook;

time_t start_time, running_time;
long mouse_click_rate = 0, mouse_total = 0;
long keyboard_click_rate = 0, keyboard_total = 0;


void MessageLoop()
{
    MSG message;
    while (GetMessage(&message,NULL,0,0))
    {
        TranslateMessage( &message );
        DispatchMessage( &message );
    }
}


__declspec(dllexport) LRESULT CALLBACK MouseEvent(int nCode, WPARAM wParam, LPARAM lParam){

        PKBDLLHOOKSTRUCT k = (PKBDLLHOOKSTRUCT)(lParam);
        POINT p;

		running_time = time(NULL) - start_time;
		long minutes = running_time / 60;

        if(wParam == WM_RBUTTONDOWN || wParam == WM_LBUTTONDOWN)
        {
          // right button clicked
			mouse_total += 1;
			mouse_click_rate = mouse_total;
			if(minutes > 0){
				mouse_click_rate = mouse_total / minutes;
			}
			//printf("MS tare = %d\n", mouse_click_rate);

			GetCursorPos(&p);
        }

		return CallNextHookEx(hMouseHook, nCode, wParam, lParam);
}


__declspec(dllexport) LRESULT CALLBACK KeyboardEvent (int nCode, WPARAM wParam, LPARAM lParam)
{
    DWORD SHIFT_key=0;
    DWORD CTRL_key=0;
    DWORD ALT_key=0;


    if  ((nCode == HC_ACTION) &&   ((wParam == WM_SYSKEYUP) ||  (wParam == WM_KEYUP)))
    {
        KBDLLHOOKSTRUCT hooked_key =    *((KBDLLHOOKSTRUCT*)lParam);
        DWORD dwMsg = 1;
        dwMsg += hooked_key.scanCode << 16;
        dwMsg += hooked_key.flags << 24;
        char lpszKeyName[1024] = {0};

        int i = GetKeyNameText(dwMsg,   (lpszKeyName+1),0xFF) + 1;

        int key = hooked_key.vkCode;

        SHIFT_key = GetAsyncKeyState(VK_SHIFT);
        CTRL_key = GetAsyncKeyState(VK_CONTROL);
        ALT_key = GetAsyncKeyState(VK_MENU);

		running_time = time(NULL) - start_time;
		long minutes = running_time / 60;

		keyboard_total += 1;
		keyboard_click_rate = keyboard_total;
		if(minutes > 0){
			keyboard_click_rate = keyboard_total / minutes;
		}

		// printf("keyboard_total = %d\n", keyboard_total);
    }
    return CallNextHookEx(hKeyboardHook,    nCode,wParam,lParam);
}


DWORD WINAPI my_Mouse(LPVOID lpParm)
{
    HINSTANCE hInstance = GetModuleHandle(NULL);
    if (!hInstance) hInstance = LoadLibrary((LPCSTR) lpParm);
    if (!hInstance) return 1;

    hMouseHook = SetWindowsHookEx(WH_MOUSE_LL, (HOOKPROC) MouseEvent, hInstance, NULL);
    MessageLoop();

    UnhookWindowsHookEx(hMouseHook);
    return 0;
}


DWORD WINAPI my_HotKey(LPVOID lpParm)
{
    HINSTANCE hInstance = GetModuleHandle(NULL);
    if (!hInstance) hInstance = LoadLibrary((LPCSTR) lpParm);
    if (!hInstance) return 1;

    hKeyboardHook = SetWindowsHookEx (  WH_KEYBOARD_LL, (HOOKPROC) KeyboardEvent,   hInstance,  NULL    );
    MessageLoop();
    UnhookWindowsHookEx(hKeyboardHook);
    return 0;
}

void main()
{
	HANDLE ghThreads[2];
    HANDLE hThread;
    DWORD dwThread;

	start_time = time(NULL);

    //printf("CTRL-y  for  H O T K E Y  \n");
    //printf("CTRL-q  to quit  \n");

    ghThreads[0] = CreateThread(NULL,NULL,(LPTHREAD_START_ROUTINE)   my_HotKey, NULL, NULL, &dwThread);
	ghThreads[1] = CreateThread(NULL,NULL,(LPTHREAD_START_ROUTINE)   my_Mouse, NULL, NULL, &dwThread);

       /* uncomment to hide console window */
    //ShowWindow(FindWindowA("ConsoleWindowClass", NULL), false);

    //if (ghThreads)
	//{
		//return WaitForMultipleObjects(2, ghThreads, TRUE, INFINITE);
		//return WaitForSingleObject(hThread,INFINITE);
	//}
    //else return 1;

}


void keyboardRateMethod(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);
    HANDLE ghMutex;
    ghMutex = CreateMutex(NULL, FALSE, NULL);
    // args.GetReturnValue().Set(v8::Number::New(isolate, keyboard_click_rate));
    // keyboard_click_rate = 0;
    args.GetReturnValue().Set(v8::Number::New(isolate, keyboard_total));
    keyboard_total = 0;
    ReleaseMutex(ghMutex);
}


void mouseRateMethod(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);
    HANDLE ghMutex;
    ghMutex = CreateMutex(NULL, FALSE, NULL);
    // args.GetReturnValue().Set(v8::Number::New(isolate, mouse_click_rate));
    // mouse_click_rate = 0;
    args.GetReturnValue().Set(v8::Number::New(isolate, mouse_total));
    mouse_total = 0;
    ReleaseMutex(ghMutex);
}


void trackMethod(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);
	main();
}


void RegisterModule(v8::Local<v8::Object> target) {
    NODE_SET_METHOD(target, "Track", trackMethod);
    NODE_SET_METHOD(target, "Keyboard", keyboardRateMethod);
    NODE_SET_METHOD(target, "Mouse", mouseRateMethod);
}

NODE_MODULE(modulename, RegisterModule);