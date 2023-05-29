#include <node.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <fcntl.h>
#include <dirent.h>
#include <linux/input.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/select.h>
#include <sys/time.h>
#include <termios.h>
#include <signal.h>
#include <dirent.h>
#include <time.h>
#include <pthread.h>
#include <set>
#include <string>


using namespace node;
using namespace v8;

char input_path[64]="/dev/input/by-path/";
char keyboard[64]="event-kbd";
char mouse[64]="event-mouse";
time_t start_time, running_time;
long keyboard_rate = 0, keyboard_total = 0;
long mouse_rate = 0, mouse_total = 0;
pthread_mutex_t mutex;

int hook_device(char *device){
    struct input_event ev;
    int fd = sizeof (struct input_event);

    //Open Device
    if ((fd = open (device, O_RDONLY)) == -1){
        printf("%s is not a vaild device.\n", device);
    }else{
        printf("%s is hooked.\n", device);
    }
    return fd;
}


std::set<int> number_of_devices(char *device_name, int& max_fd){
	DIR *dir;
	struct dirent *ep;
	char name[64];
	static char device[128];
	std::set<int> devices;

	dir = opendir (input_path);
	if (dir != NULL){
		while (ep = readdir (dir)){
                	if(strstr(ep->d_name, device_name) != NULL ){
				sprintf(device, "%s%s", input_path, ep->d_name);				
				int fd = hook_device(device);
				if(fd != -1){
					devices.insert(fd);
					max_fd = (max_fd > fd) ? max_fd : fd;
				}else{
					printf ("Can't hook device - %s.\n", device);
				}
			}
		}
		(void) closedir (dir);
	}else{
		perror ("Couldn't open the directory");
    	}
	return devices;
}

void Track(){
	int maxfd, j;
    	fd_set readset;
	std::set<int> keyboards;
	std::set<int> mouses;
    	FD_ZERO(&readset);
    	maxfd = 0;

	keyboards = number_of_devices(keyboard, maxfd);
	if(keyboards.empty()){
		printf ("No keyboards are available.\n"); 
	}

	mouses = number_of_devices(mouse, maxfd);
	if(mouses.empty()){
		printf ("No mice are available.\n");
	}

	start_time = time(NULL);
	do{
        	FD_ZERO(&readset);
        	if(!keyboards.empty()){
			for (std::set<int>::iterator it=keyboards.begin(); it!=keyboards.end(); ++it){
            			FD_SET(*it, &readset);
			}
        	}

        	if(!mouses.empty()){
            		for (std::set<int>::iterator it=mouses.begin(); it!=mouses.end(); ++it){
            			FD_SET(*it, &readset);
			}
        	}

		int result = select(maxfd+1, &readset, NULL, NULL, NULL);
        	if(result > 0){
            		struct input_event ev;
           		int rd, value, size = sizeof (struct input_event);

            		running_time = time(NULL) - start_time;
            		long minutes = running_time / 60;
            		if(minutes < 1){
                		minutes = 1;
            		}

			for (std::set<int>::iterator it=keyboards.begin(); it!=keyboards.end(); ++it){
            			if(FD_ISSET(*it, &readset) == 1){
                			memset((void*) &ev, 0, sizeof(ev));
                			if ((rd = read (*it, (void*) &ev, sizeof(ev))) < size){
                    				printf("Error, size to small\n");
                			}

                			if(ev.type == EV_KEY && ev.value == 0){
                    				keyboard_total += 1;
                    				//printf("KEYBOARD - %lu\n", keyboard_rate);
                			}
                			keyboard_rate = keyboard_total / minutes;
            			}
			}

			for (std::set<int>::iterator it=mouses.begin(); it!=mouses.end(); ++it){
            			if(FD_ISSET(*it, &readset) == 1){
                			memset((void*) &ev, 0, sizeof(ev));
                			if ((rd = read (*it, (void*) &ev, sizeof(ev))) < size){
                    				printf("Error, size to small\n");
                			}

                			if(ev.type == EV_KEY && ev.value == 0){
                    				mouse_total += 1;
                    				//printf("MOUSE - %lu \n", mouse_rate);
                			}
                			mouse_rate = mouse_total / minutes;
            			}
			}			
		}

	}while(1);
}




void *start_thread(void *data_void){
	printf("Run new thread\n");
	Track();
	return NULL;
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


void trackMethod(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);
	pthread_t inc_x_thread;
	if(pthread_create(&inc_x_thread, NULL, start_thread, NULL)) {
		fprintf(stderr, "Error creating thread\n");
	}else{
		pthread_detach(inc_x_thread);
	}
}


void RegisterModule(v8::Local<v8::Object> target) {
    NODE_SET_METHOD(target, "Track", trackMethod);
    NODE_SET_METHOD(target, "Keyboard", keyboardRateMethod);
    NODE_SET_METHOD(target, "Mouse", mouseRateMethod);
}

NODE_MODULE(modulename, RegisterModule);
























