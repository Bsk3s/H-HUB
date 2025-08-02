//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//

#import <TargetConditionals.h>
#import <Foundation/Foundation.h>

// Ensure TARGET_OS_SIMULATOR is properly defined for all builds
#ifndef TARGET_OS_SIMULATOR
  #if TARGET_IPHONE_SIMULATOR
    #define TARGET_OS_SIMULATOR 1
  #else
    #define TARGET_OS_SIMULATOR 0
  #endif
#endif
