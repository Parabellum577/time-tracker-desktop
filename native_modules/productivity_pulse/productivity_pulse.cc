#include <nan.h>
#include <ScreenAnalyzer.h>

void activeWindowTitle(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    std::string nameOfCurrentlyActiveWindow = SA::nameOfCurrentlyActiveWindow();
	if (nameOfCurrentlyActiveWindow.empty()) {
		nameOfCurrentlyActiveWindow = "Application is not detected";
	}
  info.GetReturnValue().Set(Nan::New(nameOfCurrentlyActiveWindow).ToLocalChecked());
}

void Init(v8::Local<v8::Object> exports) {
  try 
  {
  exports->Set(Nan::New("activeWindowTitle").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(activeWindowTitle)->GetFunction());
  }
  catch (...)
	{
		
	}
}

NODE_MODULE(productivity_pulse, Init)
