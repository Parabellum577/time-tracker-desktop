{
    'targets': [
        {
            'target_name': 'productivity_pulse',
            'sources': [
                'productivity_pulse.cc'
            ],
            'dependencies': [
                'dependencies/ScreenAnalyzer.gyp:ScreenAnalyzer'
            ],
            'cflags': [
                '-std=c++11'
            ],
            'include_dirs': [
                "<!(node -e \"require('nan')\")",
            ],
            'conditions': [
                ['OS=="mac"', {
                    'xcode_settings': {
                        'MACOSX_DEPLOYMENT_TARGET': '10.9',
                        'OTHER_CPLUSPLUSFLAGS': [
                            '-std=c++11',
                            '-stdlib=libc++',
                            '-v'
                        ],
                        'OTHER_LDFLAGS': [
                            '-stdlib=libc++'
                        ],
                        'MACOSX_DEPLOYMENT_TARGET': '10.9',
                        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
                    }
                }],
                ['OS=="linux"', {
                    'cflags_cc': [
                        '-std=c++11',
                        '-fexceptions'
                    ],
                    "libraries": [
                        '-lX11'
                    ],
                }],
                ['OS=="win"', {

                }],
            ]
        },
    ]
}
