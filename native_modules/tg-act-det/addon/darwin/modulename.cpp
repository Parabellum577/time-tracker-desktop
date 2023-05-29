//
//  main.c
//  keylogger
//
//  Created by Igor Kupreev on 4/7/17.
//  Copyright © 2017 Igor Kupreev. All rights reserved.
//

#include <node.h>
#include <stdio.h>
#include <time.h>
#include <pthread.h>
#include <ApplicationServices/ApplicationServices.h>

using namespace node;
using namespace v8;

// This callback will be invoked every time there is a keystroke.
//
time_t start_time, running_time;

long keyboard_rate = 0, keyboard_total = 0;
long mouse_click_rate = 0, mouse_total = 0;

pthread_mutex_t mutex;


CGEventRef myCGEventCallback(CGEventTapProxy proxy, CGEventType type,
                             CGEventRef event, void *refcon)
{
    running_time = time(NULL) - start_time;
    long minutes = running_time / 60;
    if (type == kCGEventKeyDown){
        keyboard_total += 1;
        if(minutes > 0){
            keyboard_rate = keyboard_total / minutes;
        }else{
            keyboard_rate = keyboard_total;
        }
        //printf("%lu - keyboard rate\n", keyboard_rate);
    }
    
    if (type == kCGEventMouseMoved){
        //printf("%s", "moved\n");
    }
    
    if (type == kCGEventLeftMouseDown || type == kCGEventRightMouseDown){
        mouse_total += 1;
        if(minutes > 0){
            mouse_click_rate = mouse_total / minutes;
        }else{
            mouse_click_rate = mouse_total;
        }
        //printf("%lu - mouse rate\n", mouse_click_rate);
    }
    return event;
}


void keyboardHook(){
    CFMachPortRef      eventTap;
    CGEventMask        eventMask;
    CFRunLoopSourceRef runLoopSource;
    
    // Create an event tap. We are interested in key presses.
    eventMask = CGEventMaskBit(kCGEventKeyDown) ;
    eventTap = CGEventTapCreate(kCGHIDEventTap,
                                kCGHeadInsertEventTap,
                                kCGEventTapOptionDefault,
                                eventMask,
                                myCGEventCallback,
                                NULL);
    if (!eventTap) {
        fprintf(stderr, "failed to create event tap\n");
        return;
    }
    
    // Create a run loop source.
    runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault,
                                                  eventTap,
                                                  0);
    
    // Add to the current run loop.
    CFRunLoopAddSource(CFRunLoopGetCurrent(),
                       runLoopSource,
                       kCFRunLoopCommonModes);
    
    // Enable the event tap.
    CGEventTapEnable(eventTap, true);
    
    // Set it all running.
    CFRelease(eventTap);
    CFRelease(runLoopSource);
}


void mouseHook(){
    CFMachPortRef      eventTap;
    CGEventMask        eventMask;
    CFRunLoopSourceRef runLoopSource;
    
    // Create an event tap. We are interested in key presses.t
    eventMask = CGEventMaskBit(kCGEventMouseMoved) | CGEventMaskBit(kCGEventLeftMouseDown) | CGEventMaskBit(kCGEventRightMouseDown);
    eventTap = CGEventTapCreate(kCGHIDEventTap,
                                kCGHeadInsertEventTap,
                                kCGEventTapOptionDefault,
                                eventMask,
                                myCGEventCallback,
                                NULL);
    if (!eventTap) {
        fprintf(stderr, "failed to create event tap\n");
        return;
    }
    
    // Create a run loop source.
    runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault,
                                                  eventTap,
                                                  0);
    
    // Add to the current run loop.
    CFRunLoopAddSource(CFRunLoopGetCurrent(),
                       runLoopSource,
                       kCFRunLoopCommonModes);
    
    // Enable the event tap.
    CGEventTapEnable(eventTap, true);
    
    // Set it all running.
    CFRelease(eventTap);
    CFRelease(runLoopSource);
}


void Add() {
    start_time = time(NULL);
    
    //hook devices
    keyboardHook();
    mouseHook();
    
    //run all the tracking
    CFRunLoopRun();
}


void trackMethod(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);
    pthread_mutex_init(&mutex, NULL);
    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        Add();
    });
}


void keyboardRateMethod(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);
    pthread_mutex_lock(&mutex);
    args.GetReturnValue().Set(v8::Number::New(isolate, keyboard_total));
    keyboard_total = 0;
    pthread_mutex_unlock(&mutex);
}

void mouseRateMethod(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);
    pthread_mutex_lock(&mutex);
    args.GetReturnValue().Set(v8::Number::New(isolate, mouse_total));
    mouse_total = 0;
    pthread_mutex_unlock(&mutex);
}


void RegisterModule(v8::Local<v8::Object> target) {
    NODE_SET_METHOD(target, "Track", trackMethod);
    NODE_SET_METHOD(target, "Keyboard", keyboardRateMethod);
    NODE_SET_METHOD(target, "Mouse", mouseRateMethod);
    // You can add properties to the module in this function. It is called
    // when the module is required by node.
}

NODE_MODULE(modulename, RegisterModule);


