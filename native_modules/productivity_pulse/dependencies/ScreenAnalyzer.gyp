{
    "targets": [
        {
            "target_name": "ScreenAnalyzer",
            "product_name": "ScreenAnalyzer",
            "type": "static_library",
            "include_dirs": [
                "include"
            ],
            'direct_dependent_settings': {
              'include_dirs': [ 'include/' ],
            },
            'conditions': [  
                ['OS=="mac"', {
                    "sources": [
                        "src/darwin/ScreenAnalyzer.mm"
                    ],
                }],
                ['OS=="linux"', {
                    "sources": [
                        "src/linux/ScreenAnalyzer.cpp"
                    ],
                    'cflags': [
                        '<!@(pkg-config --cflags x11)'
                    ],
                    'ldflags': [
                        '<!@(pkg-config --libs-only-L --libs-only-other x11)'
                    ],
                    'libraries': [
                        '<!@(pkg-config --libs-only-L --libs-only-other x11)'
                    ],
                }],
                ['OS=="win"', {
                    "sources": [
                        "src/win/ScreenAnalyzer.cpp"
                    ],
                }],
            ]
        }
    ]
}