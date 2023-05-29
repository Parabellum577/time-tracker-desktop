
#include <node.h>

#include <string>
#include <iostream>
#include <algorithm>
#include "windows.h"
#include "tlhelp32.h"
#include "winuser.h"
#include "UIAutomation.h"

using namespace std;

IUIAutomation *uiA = NULL;
IUIAutomationElement *pElementBrowser = NULL;
IUIAutomationCondition *editBoxCondition = NULL;
IUIAutomationElement *editBoxElement = NULL;
IUIAutomationCondition *comboBoxCondition = NULL;
IUIAutomationElement *comboBoxElement = NULL;
IUIAutomationTreeWalker *treeWalker = NULL;
IUIAutomationElement *siteInformation = NULL;
IUIAutomationElementArray *editBoxes = NULL;
HRESULT hr = NULL;

wstring globalUrl;
wstring globalName;

namespace demo
{

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void wstring_to_string(const std::wstring& src, std::string& dest)
{
    std::string tmp;
    tmp.resize(src.size());
    std::transform(src.begin(),src.end(),tmp.begin(),wctob);
    tmp.swap(dest);
}

void fox(HWND hWndBrowser)
{
	try
	{
		if (hWndBrowser != NULL)
		{

			hr = uiA->ElementFromHandle((UIA_HWND)hWndBrowser, &pElementBrowser);
			if (SUCCEEDED(hr))
			{
				VARIANT comboProp;
				comboProp.vt = VT_I4;
				comboProp.lVal = UIA_ComboBoxControlTypeId;

				hr = uiA->CreatePropertyCondition(UIA_ControlTypePropertyId, comboProp, &comboBoxCondition);
				if (SUCCEEDED(hr))
				{

					hr = pElementBrowser->FindFirst(TreeScope_Descendants, comboBoxCondition, &comboBoxElement);
					if (SUCCEEDED(hr))
					{

						hr = uiA->get_ControlViewWalker(&treeWalker);
						if (SUCCEEDED(hr))
						{

							hr = treeWalker->GetFirstChildElement(comboBoxElement, &siteInformation);
							if (SUCCEEDED(hr))
							{

								hr = treeWalker->GetNextSiblingElement(siteInformation, &editBoxElement);
								if (SUCCEEDED(hr))
								{

									wchar_t name[100];
									GetWindowTextW(hWndBrowser, name, 100);
									globalName = name;

									VARIANT urlProp;
									editBoxElement->GetCurrentPropertyValue(UIA_ValueValuePropertyId, &urlProp);
									BSTR url;
									url = urlProp.bstrVal;
									wstring urlStr(url, SysStringLen(url));

									globalUrl = urlStr;

									VariantClear(&urlProp);
									SysFreeString(url);
								}
							}
						}
					}
				}
			}
			comboBoxElement->Release();
			comboBoxElement = NULL;
			treeWalker->Release();
			treeWalker = NULL;
			siteInformation->Release();
			siteInformation = NULL;
			editBoxElement->Release();
			editBoxElement = NULL;
			pElementBrowser->Release();
			pElementBrowser = NULL;
		}
	}
	catch (...)
	{
		cout << "ERROR";
	}
}

void chromium(HWND hWndBrowser) {
    try
    {
        while(true) {
			if (hWndBrowser == NULL) {
				break;
			}

			hr = uiA->ElementFromHandle((UIA_HWND) hWndBrowser, &pElementBrowser);

			if (!SUCCEEDED(hr)) {
				break;
			}

			VARIANT varProp;
			varProp.vt = VT_I4;
			varProp.lVal = UIA_EditControlTypeId;

			hr = uiA->CreatePropertyCondition(UIA_ControlTypePropertyId, varProp, &editBoxCondition);

			if (!SUCCEEDED(hr)) {
				break;
			}

			hr = pElementBrowser->FindAll(TreeScope_Descendants, editBoxCondition, &editBoxes);
			if (!SUCCEEDED(hr)) {
				break;
			}
			int countOfEditBoxes = 0;
			editBoxes->get_Length(&countOfEditBoxes);
			// cout << countOfEditBoxes << endl;
			if (countOfEditBoxes > 0) {
				hr = editBoxes->GetElement(countOfEditBoxes - 1, &editBoxElement);
				if (!SUCCEEDED(hr)) {
					break;
				}

				VARIANT urlProp;
				editBoxElement->GetCurrentPropertyValue(UIA_ValueValuePropertyId, &urlProp); // получить значение тип, результат
				BSTR url;
				url = urlProp.bstrVal;
				wstring urlStr(url, SysStringLen(url));
				globalUrl = urlStr;
				VariantClear(&varProp);
				VariantClear(&urlProp);
				SysFreeString(url);
			}
			break;
		}
		if (editBoxElement != NULL) {
            editBoxElement->Release();
        }
        editBoxElement = NULL;
        if (editBoxCondition != NULL) {
            editBoxCondition->Release();
        }
        editBoxCondition = NULL;
        if (pElementBrowser != NULL) {
            pElementBrowser->Release();
        }
        pElementBrowser = NULL;
    }
    catch (...) {
        cout << "ERROR";
    }
}

void edge(HWND hWndBrowser)
{
	//Спустится вниз по дереву поиск по имени элемента первое вхождение "RichEditBox" будет строка адреса

	try //Перехватить ошибку во время закрытия браузера
	{
		if (hWndBrowser != NULL)
		{ //Проверить идентификатор окна

			hr = uiA->ElementFromHandle((UIA_HWND)hWndBrowser, &pElementBrowser); //Получить указатель на элемент в зависимости от хендлера
			if (SUCCEEDED(hr))
			{
				VARIANT varProp;								  //структура COM
				varProp.vt = VT_BSTR;							  //тип значения
				varProp.bstrVal = SysAllocString(L"RichEditBox"); //значение

				hr = uiA->CreatePropertyCondition(UIA_ClassNamePropertyId, varProp, &editBoxCondition); //условие поиска, тип, значение, результат
				if (SUCCEEDED(hr))
				{

					hr = pElementBrowser->FindFirst(TreeScope_Descendants, editBoxCondition, &editBoxElement); //область поиска, условие, результат
					if (SUCCEEDED(hr))
					{
						if (editBoxElement != NULL)
						{

							//wchar_t name[100];
							//GetWindowTextW(hWndBrowser, name, 100);
							//globalName = name;

							VARIANT urlProp;																  //структура COM
							hr = editBoxElement->GetCurrentPropertyValue(UIA_ValueValuePropertyId, &urlProp); // получить значение тип, результат
							if (SUCCEEDED(hr))
							{
								BSTR url;
								url = urlProp.bstrVal;					//структура.значение
								wstring urlStr(url, SysStringLen(url)); //преобразовать  COM тип в STL класс Unicod
								globalUrl = urlStr;						// глобальная переменная для всех url

								//wcout << globalName << endl;
								//wcout << globalUrl << endl;

								//printf("%s\n", name);
								//wprintf(L"%s\n", url);
								VariantClear(&varProp);
								VariantClear(&urlProp);
								SysFreeString(url);
							}
						}
					}
					editBoxElement = NULL;
					//editBoxElement->Release(); //краш
				}
				editBoxCondition->Release();
				editBoxCondition = NULL;
			}
			pElementBrowser->Release();
			pElementBrowser = NULL;
		}
	}
	catch (...)
	{
		cout << "ERROR";
	}
}

string getCurrentProcessName(HWND hwnd) {
	DWORD dwProcId = 0; 
	GetWindowThreadProcessId(hwnd, &dwProcId);   
    int pidExeFile = int(dwProcId);
    PROCESSENTRY32  *pe32 = new PROCESSENTRY32 [sizeof(PROCESSENTRY32)];
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);

    if(hSnapshot == INVALID_HANDLE_VALUE)
        return "";

    if(!Process32First(hSnapshot, pe32))
    {
        CloseHandle(hSnapshot);
        return "";
    }

    while(Process32Next( hSnapshot, pe32 ))
    {
        if(pidExeFile == int(pe32->th32ProcessID))
        {
			return pe32->szExeFile;
        }
    }

    return "";
}

BOOL CALLBACK CheckWindowTextForBrowser()
{
	HWND hwnd = GetForegroundWindow();
	string processName = getCurrentProcessName(hwnd);

	if (processName == "chrome.exe") {
		chromium(hwnd);
		return 1;
	}

	// TOO ABSTRACT PROCESS NAME
	// if (processName == "ApplicationFrameHost.exe") {
	// 	cout << "MicrosoftEdge" << endl;
	// 	edge(hwnd);
	// 	return 1;
	// }

	// NOT WORK
	// if (processName == "opera.exe") {
	// 	cout << "opera" << endl;
	// 	chromium(hwnd);
	// 	return 1;
	// }

	// ERROR
	// if (processName == "firefox.exe") { 
	// 	cout << "firefox" << endl;
	// 	fox(hwnd);
	// 	return 1;
	// }
	return false;
}

void Method(const FunctionCallbackInfo<Value> &args)
{

	Isolate *isolate = args.GetIsolate();

	CoInitialize(NULL);																					 //Инициализировать UI Automation библиотеку
	CoCreateInstance(CLSID_CUIAutomation, NULL, CLSCTX_INPROC_SERVER, IID_IUIAutomation, (void **)&uiA); // Создать COM елемент UI Automation
	// HWND window = GetForegroundWindow();
	// EnumWindows(CheckWindowTextForBrowser, 0);															 //Просмотреть все окна вызвать Callback
	if (CheckWindowTextForBrowser()) {
		Local<String> returnUrl = String::NewFromTwoByte(isolate, (uint16_t *)globalUrl.c_str()); //преобразовать STL класс Unicode в string node.js
		args.GetReturnValue().Set(returnUrl);													  //Вернуть результаты в node.js
	} else {
		wchar_t buff[300] = L"";
		char cbuff[600];
		wcstombs( cbuff, buff, wcslen(buff) );
		Local<String> str = String::NewFromUtf8(isolate, (const char *) cbuff, v8::String::kNormalString, wcslen(buff));
		args.GetReturnValue().Set(str);
	}
	CoUninitialize();
}

void init(Local<Object> exports)
{

	NODE_SET_METHOD(exports, "getUrl", Method);
}

NODE_MODULE(addon, init)

}