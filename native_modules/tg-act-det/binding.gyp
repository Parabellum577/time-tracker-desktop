{
  "targets": [
    {
      "target_name": "modulename",
      'conditions': [  
                ['OS=="win"', {
                    "sources": [ "addon/windows/modulename.cpp" ]
                }],
                ['OS=="linux"', {
                    "sources": [ "addon/linux/modulename.cpp" ],
                    'cflags_cc' : [
                        '-std=c++11'
                    ]
                }],
                ['OS=="mac"', {
                    "sources": [ "addon/darwin/modulename.cpp" ],
                    'xcode_settings': {
                        'MACOSX_DEPLOYMENT_TARGET': '10.9',
                        'OTHER_CPLUSPLUSFLAGS': [
                            '-v'
                            ],
                        'OTHER_LDFLAGS': [
                            '-stdlib=libc++'
                        ],
                        'MACOSX_DEPLOYMENT_TARGET': '10.9',
                        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
                    },
                    'link_settings': {
                        'libraries': [
                            '$(SDKROOT)/System/Library/Frameworks/ApplicationServices.framework',
                        ]
                    }
                }],
      ]
    }
  ]
}
