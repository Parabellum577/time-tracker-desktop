#include <ScreenAnalyzer.h>

#ifdef __APPLE__
#include <CoreFoundation/CoreFoundation.h>
#include <CoreGraphics/CoreGraphics.h>
#include <ApplicationServices/ApplicationServices.h>
#include <AppKit/AppKit.h>
#include <Foundation/Foundation.h>
#endif

namespace SA {
    NSString *detailsForApplicationWithName(NSString *appName) {
        NSString *result;
        @try {
            NSDictionary* applicationDetailsScripts = @{@"Google Chrome": @"tell application \"Google Chrome\" to return title of active tab of front window",
                                                        @"Google Chrome Canary": @"tell application \"Google Chrome Canary\" to return title of active tab of front window",
                                                        @"Chromium": @"tell application \"Chromium\" to return title of active tab of front window",
                                                        @"Safari": @"tell application \"Safari\" to return name of front document",
                                                        @"Webkit": @"tell application \"Webkit\" to return name of front document",
                                                        @"Opera": @"tell application \"Opera\" to return name of front document",
                                                        //                                                    @"Firefox": @"tell application \"System Events\"\nkeystroke \"l\" using command down\nkeystroke \"c\" using command down\nend tell\ndelay 0.5\nreturn the clipboard",
                                                        @"Camino": @"tell application \"Camino\" to return name of current tab of front browser window"};
            NSString *scriptString = [applicationDetailsScripts objectForKey:appName];
            if (scriptString.length == 0) {
                return nil;
            }
            
            NSAppleScript *script = [[NSAppleScript alloc] initWithSource:scriptString];
            NSDictionary *scriptError = nil;
            NSAppleEventDescriptor *eventDescriptor = [script executeAndReturnError:&scriptError];
            if (scriptError) {
                NSLog(@"Error: %@", scriptError);
                return nil;
            }
            
            NSAppleEventDescriptor *unicodeEventDescriptor = [eventDescriptor coerceToDescriptorType:typeUnicodeText];
            NSData *data = [unicodeEventDescriptor data];
            result = [[NSString alloc] initWithCharacters:(unichar*)[data bytes] length:[data length] / sizeof(unichar)];
        }
        @catch (NSException *exception) {
            NSLog(@"%@", exception.reason);
            NSLog(@"%@", @"detailsForApplicationWithName func EXEPTION");
        return @"";
        }
        return result;
    }
    
    std::string nameOfCurrentlyActiveWindow() {
        std::string applicationInfoUTF8String;
        
        NSMutableString *localizedName = [NSWorkspace sharedWorkspace].frontmostApplication.localizedName.mutableCopy;
        if (localizedName.length > 0) {
            NSString *applicationInfoString = detailsForApplicationWithName(localizedName);
            if (applicationInfoString.length > 0) {
                [localizedName appendFormat:@" - %@", applicationInfoString];
            }
            applicationInfoUTF8String = std::string([localizedName UTF8String]);
        }
        return applicationInfoUTF8String;
    }
}

